-- DayQuest shared family data: one private, versioned JSON document per auth user.
create table if not exists public.dayquest_family_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  version bigint not null default 1 check (version >= 1),
  updated_at timestamptz not null default now()
);
alter table public.dayquest_family_data enable row level security;
drop policy if exists "Users can read their own DayQuest family data" on public.dayquest_family_data;
create policy "Users can read their own DayQuest family data"
  on public.dayquest_family_data for select to authenticated
  using (auth.uid() = user_id);
revoke all on public.dayquest_family_data from anon, authenticated;
grant select on public.dayquest_family_data to authenticated;

create or replace function public.dayquest_save_family_data(p_payload jsonb, p_expected_version bigint)
returns bigint language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_new_version bigint;
begin
  if v_user_id is null then
    raise exception 'Authentication required to save DayQuest family data' using errcode = '42501';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'DayQuest family payload must be a JSON object' using errcode = '22023';
  end if;
  if p_expected_version is null or p_expected_version < 0 then
    raise exception 'Invalid expected DayQuest data version' using errcode = '22023';
  end if;

  if p_expected_version = 0 then
    insert into public.dayquest_family_data(user_id, payload, version, updated_at)
    values (v_user_id, p_payload, 1, now())
    on conflict (user_id) do nothing
    returning version into v_new_version;
    if v_new_version is not null then return v_new_version; end if;
  end if;

  update public.dayquest_family_data
     set payload = p_payload, version = version + 1, updated_at = now()
   where user_id = v_user_id and version = p_expected_version
  returning version into v_new_version;

  if v_new_version is null then
    raise exception 'DAYQUEST_VERSION_CONFLICT' using errcode = 'P0001';
  end if;
  return v_new_version;
end;
$$;
revoke all on function public.dayquest_save_family_data(jsonb, bigint) from public;
grant execute on function public.dayquest_save_family_data(jsonb, bigint) to authenticated;
