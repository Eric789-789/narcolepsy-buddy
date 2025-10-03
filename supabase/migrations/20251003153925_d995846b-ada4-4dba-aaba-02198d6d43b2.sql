-- Enable RLS on all tables
ALTER TABLE public.sleep_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.naps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arm_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for sleep_entries
CREATE POLICY "Users can view their own sleep entries"
  ON public.sleep_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sleep entries"
  ON public.sleep_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep entries"
  ON public.sleep_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep entries"
  ON public.sleep_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for naps
CREATE POLICY "Users can view their own naps"
  ON public.naps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own naps"
  ON public.naps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own naps"
  ON public.naps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own naps"
  ON public.naps FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for check_ins
CREATE POLICY "Users can view their own check-ins"
  ON public.check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own check-ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
  ON public.check_ins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-ins"
  ON public.check_ins FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for medications
CREATE POLICY "Users can view their own medications"
  ON public.medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications"
  ON public.medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON public.medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON public.medications FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for med_intakes
CREATE POLICY "Users can view their own med intakes"
  ON public.med_intakes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own med intakes"
  ON public.med_intakes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own med intakes"
  ON public.med_intakes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own med intakes"
  ON public.med_intakes FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for experiments
CREATE POLICY "Users can view their own experiments"
  ON public.experiments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own experiments"
  ON public.experiments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiments"
  ON public.experiments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiments"
  ON public.experiments FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for arm_assignments
CREATE POLICY "Users can view their own arm assignments"
  ON public.arm_assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own arm assignments"
  ON public.arm_assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own arm assignments"
  ON public.arm_assignments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own arm assignments"
  ON public.arm_assignments FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON public.user_settings FOR DELETE
  USING (auth.uid() = user_id);