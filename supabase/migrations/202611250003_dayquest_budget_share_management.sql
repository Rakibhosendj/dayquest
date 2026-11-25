-- Owner-facing budget share management for DayQuest.
create or replace function public.dayquest_list_owned_budget_shares()
returns table(
  shared_budget_id uuid,
  budget_key text,
  budget_name text,
  member_id uuid,
  member_email text,
  permission text,
  updated_at timestamptz
)
language sql stable security definer set search_path = public, auth, pg_temp
as $$
  select b.id, b.budget_key, coalesce(b.budget->>'name','Budget'),
         m.recipient_id, u.email::text, m.permission, b.updated_at
    from public.dayquest_shared_budgets b
    join public.dayquest_shared_budget_members m on m.shared_budget_id=b.id
    join auth.users u on u.id=m.recipient_id
   where b.owner_id=auth.uid()
   order by b.updated_at desc, u.email;
$$;
revoke all on function public.dayquest_list_owned_budget_shares() from public;
grant execute on function public.dayquest_list_owned_budget_shares() to authenticated;
