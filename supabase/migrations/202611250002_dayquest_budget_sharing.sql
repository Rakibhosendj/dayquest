-- Secure cross-account sharing for individual DayQuest budget plans.
create table if not exists public.dayquest_shared_budgets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  budget_key text not null,
  budget jsonb not null check (jsonb_typeof(budget) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, budget_key)
);

create table if not exists public.dayquest_shared_budget_members (
  id uuid primary key default gen_random_uuid(),
  shared_budget_id uuid not null references public.dayquest_shared_budgets(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  permission text not null check (permission in ('view', 'edit')),
  added_at timestamptz not null default now(),
  unique (shared_budget_id, recipient_id)
);

alter table public.dayquest_shared_budgets enable row level security;
alter table public.dayquest_shared_budget_members enable row level security;
revoke all on public.dayquest_shared_budgets, public.dayquest_shared_budget_members from anon, authenticated;

create or replace function public.dayquest_share_budget(
  p_budget_key text, p_budget jsonb, p_recipient_email text, p_permission text default 'view'
) returns uuid
language plpgsql security definer set search_path = public, auth, pg_temp
as $$
declare
  v_owner uuid := auth.uid();
  v_recipient uuid;
  v_budget_id uuid;
begin
  if v_owner is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if coalesce(trim(p_budget_key),'') = '' or length(p_budget_key) > 160 then
    raise exception 'Invalid budget key' using errcode='22023';
  end if;
  if p_budget is null or jsonb_typeof(p_budget) <> 'object' then
    raise exception 'Invalid budget data' using errcode='22023';
  end if;
  if lower(coalesce(p_permission,'')) not in ('view','edit') then
    raise exception 'Permission must be view or edit' using errcode='22023';
  end if;
  select id into v_recipient from auth.users
   where lower(email) = lower(trim(p_recipient_email)) and email_confirmed_at is not null
   limit 1;
  if v_recipient is null then
    raise exception 'No verified DayQuest account found for that email. Ask them to register and verify first.' using errcode='P0002';
  end if;
  if v_recipient = v_owner then raise exception 'You cannot share a budget with your own account' using errcode='22023'; end if;

  insert into public.dayquest_shared_budgets(owner_id,budget_key,budget)
  values(v_owner,trim(p_budget_key),p_budget)
  on conflict(owner_id,budget_key) do update
    set budget=excluded.budget, updated_at=now()
  returning id into v_budget_id;

  insert into public.dayquest_shared_budget_members(shared_budget_id,recipient_id,permission)
  values(v_budget_id,v_recipient,lower(p_permission))
  on conflict(shared_budget_id,recipient_id) do update
    set permission=excluded.permission;
  return v_budget_id;
end;
$$;

create or replace function public.dayquest_list_shared_budgets()
returns table(
  id uuid, budget_key text, budget jsonb, permission text,
  owner_email text, updated_at timestamptz, is_owner boolean
)
language sql stable security definer set search_path = public, auth, pg_temp
as $$
  select b.id, b.budget_key, b.budget,
         case when b.owner_id = auth.uid() then 'owner' else m.permission end,
         u.email::text, b.updated_at, (b.owner_id = auth.uid())
    from public.dayquest_shared_budgets b
    join auth.users u on u.id = b.owner_id
    left join public.dayquest_shared_budget_members m
      on m.shared_budget_id = b.id and m.recipient_id = auth.uid()
   where b.owner_id = auth.uid() or m.recipient_id = auth.uid()
   order by b.updated_at desc;
$$;

create or replace function public.dayquest_update_shared_budget(p_shared_budget_id uuid, p_budget jsonb)
returns void
language plpgsql security definer set search_path = public, auth, pg_temp
as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_budget is null or jsonb_typeof(p_budget) <> 'object' then
    raise exception 'Invalid budget data' using errcode='22023';
  end if;
  update public.dayquest_shared_budgets b
     set budget=p_budget, updated_at=now()
   where b.id=p_shared_budget_id
     and (b.owner_id=v_user or exists (
       select 1 from public.dayquest_shared_budget_members m
        where m.shared_budget_id=b.id and m.recipient_id=v_user and m.permission='edit'
     ));
  if not found then raise exception 'Budget not found or edit access denied' using errcode='42501'; end if;
end;
$$;

create or replace function public.dayquest_update_owned_budget(p_budget_key text, p_budget jsonb)
returns integer
language plpgsql security definer set search_path = public, auth, pg_temp
as $$
declare v_user uuid := auth.uid(); v_count integer;
begin
  if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_budget is null or jsonb_typeof(p_budget) <> 'object' then
    raise exception 'Invalid budget data' using errcode='22023';
  end if;
  update public.dayquest_shared_budgets
     set budget=p_budget, updated_at=now()
   where owner_id=v_user and budget_key=p_budget_key;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.dayquest_remove_budget_access(p_shared_budget_id uuid, p_member_id uuid default null)
returns void
language plpgsql security definer set search_path = public, auth, pg_temp
as $$
declare v_user uuid := auth.uid(); v_owner uuid;
begin
  if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select owner_id into v_owner from public.dayquest_shared_budgets where id=p_shared_budget_id;
  if v_owner is null then raise exception 'Budget not found' using errcode='P0002'; end if;
  if v_owner=v_user then
    if p_member_id is null then
      delete from public.dayquest_shared_budgets where id=p_shared_budget_id;
    else
      delete from public.dayquest_shared_budget_members
       where shared_budget_id=p_shared_budget_id and recipient_id=p_member_id;
    end if;
  elsif p_member_id is null or p_member_id=v_user then
    delete from public.dayquest_shared_budget_members
     where shared_budget_id=p_shared_budget_id and recipient_id=v_user;
  else
    raise exception 'Access denied' using errcode='42501';
  end if;
end;
$$;

revoke all on function public.dayquest_share_budget(text,jsonb,text,text) from public;
revoke all on function public.dayquest_list_shared_budgets() from public;
revoke all on function public.dayquest_update_shared_budget(uuid,jsonb) from public;
revoke all on function public.dayquest_update_owned_budget(text,jsonb) from public;
revoke all on function public.dayquest_remove_budget_access(uuid,uuid) from public;
grant execute on function public.dayquest_share_budget(text,jsonb,text,text) to authenticated;
grant execute on function public.dayquest_list_shared_budgets() to authenticated;
grant execute on function public.dayquest_update_shared_budget(uuid,jsonb) to authenticated;
grant execute on function public.dayquest_update_owned_budget(text,jsonb) to authenticated;
grant execute on function public.dayquest_remove_budget_access(uuid,uuid) to authenticated;
