-- Disable RLS on all tables to allow public access
ALTER TABLE public.sleep_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.naps DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_intakes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.arm_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies since we don't need them anymore
DROP POLICY IF EXISTS "Users can manage their sleep entries" ON public.sleep_entries;
DROP POLICY IF EXISTS "Users can manage their naps" ON public.naps;
DROP POLICY IF EXISTS "Users can manage their check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can manage their medications" ON public.medications;
DROP POLICY IF EXISTS "Users can manage their med intakes" ON public.med_intakes;
DROP POLICY IF EXISTS "Users can manage their experiments" ON public.experiments;
DROP POLICY IF EXISTS "Users can manage their arm assignments" ON public.arm_assignments;
DROP POLICY IF EXISTS "Users can manage their settings" ON public.user_settings;