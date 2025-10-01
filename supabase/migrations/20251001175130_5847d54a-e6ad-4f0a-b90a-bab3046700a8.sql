-- Drop all RLS policies since this is a single-user app without authentication

-- Drop policies on sleep_entries
DROP POLICY IF EXISTS "Users can view their own sleep entries" ON public.sleep_entries;
DROP POLICY IF EXISTS "Users can create their own sleep entries" ON public.sleep_entries;
DROP POLICY IF EXISTS "Users can update their own sleep entries" ON public.sleep_entries;
DROP POLICY IF EXISTS "Users can delete their own sleep entries" ON public.sleep_entries;

-- Drop policies on naps
DROP POLICY IF EXISTS "Users can view their own naps" ON public.naps;
DROP POLICY IF EXISTS "Users can create their own naps" ON public.naps;
DROP POLICY IF EXISTS "Users can update their own naps" ON public.naps;
DROP POLICY IF EXISTS "Users can delete their own naps" ON public.naps;

-- Drop policies on check_ins
DROP POLICY IF EXISTS "Users can view their own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can create their own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can update their own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can delete their own check-ins" ON public.check_ins;

-- Drop policies on medications
DROP POLICY IF EXISTS "Users can view their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can create their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can update their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can delete their own medications" ON public.medications;

-- Drop policies on med_intakes
DROP POLICY IF EXISTS "Users can view their own med intakes" ON public.med_intakes;
DROP POLICY IF EXISTS "Users can create their own med intakes" ON public.med_intakes;
DROP POLICY IF EXISTS "Users can update their own med intakes" ON public.med_intakes;
DROP POLICY IF EXISTS "Users can delete their own med intakes" ON public.med_intakes;

-- Drop policies on experiments
DROP POLICY IF EXISTS "Users can view their own experiments" ON public.experiments;
DROP POLICY IF EXISTS "Users can create their own experiments" ON public.experiments;
DROP POLICY IF EXISTS "Users can update their own experiments" ON public.experiments;
DROP POLICY IF EXISTS "Users can delete their own experiments" ON public.experiments;

-- Drop policies on arm_assignments
DROP POLICY IF EXISTS "Users can view their own arm assignments" ON public.arm_assignments;
DROP POLICY IF EXISTS "Users can create their own arm assignments" ON public.arm_assignments;
DROP POLICY IF EXISTS "Users can update their own arm assignments" ON public.arm_assignments;
DROP POLICY IF EXISTS "Users can delete their own arm assignments" ON public.arm_assignments;

-- Drop policies on user_settings
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;