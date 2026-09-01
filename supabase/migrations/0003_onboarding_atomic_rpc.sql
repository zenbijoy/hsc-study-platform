-- Add onboarding tracking & preference columns to public.profiles
alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_status text not null default 'not_started' check (onboarding_status in ('not_started', 'in_progress', 'completed')),
  add column if not exists preferred_subjects text[] not null default '{}',
  add column if not exists study_focus text[] not null default '{}',
  add column if not exists daily_goal_minutes int default 30;

-- Atomic Onboarding Completion RPC
create or replace function public.complete_onboarding_atomic(
  p_hsc_year int,
  p_student_group text,
  p_board text,
  p_preferred_subjects text[] default '{}',
  p_study_focus text[] default '{}',
  p_daily_goal_minutes int default 30
)
returns setof public.profiles
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized: No active authentication session.';
  end if;

  if p_hsc_year is null or p_hsc_year < 2024 or p_hsc_year > 2035 then
    raise exception 'Invalid HSC year: must be between 2024 and 2035.';
  end if;

  if p_student_group is null or length(trim(p_student_group)) = 0 then
    raise exception 'Invalid student group: group is required.';
  end if;

  if p_board is null or length(trim(p_board)) = 0 then
    raise exception 'Invalid board: education board is required.';
  end if;

  return query
  update public.profiles
  set
    hsc_year = p_hsc_year,
    student_group = trim(p_student_group),
    board = trim(p_board),
    preferred_subjects = coalesce(p_preferred_subjects, '{}'::text[]),
    study_focus = coalesce(p_study_focus, '{}'::text[]),
    daily_goal_minutes = coalesce(p_daily_goal_minutes, 30),
    onboarding_completed = true,
    onboarding_status = 'completed',
    updated_at = now()
  where id = v_user_id
  returning *;
end;
$$;
