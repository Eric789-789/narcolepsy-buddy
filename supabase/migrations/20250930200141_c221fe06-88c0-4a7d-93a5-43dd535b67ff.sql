-- Create tables for narcolepsy tracking app

-- Sleep entries table
CREATE TABLE public.sleep_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  bed_time TEXT NOT NULL,
  wake_time TEXT NOT NULL,
  total_sleep_minutes INTEGER,
  quality INTEGER CHECK (quality >= 1 AND quality <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Naps table
CREATE TABLE public.naps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration INTEGER,
  quality INTEGER CHECK (quality >= 1 AND quality <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Check-ins table
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  context TEXT CHECK (context IN ('Morning', 'Midday', 'Evening', 'Other')),
  sss INTEGER CHECK (sss >= 1 AND sss <= 7),
  physical_activity TEXT,
  symptoms TEXT,
  medication TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Medications table
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Medication intakes table
CREATE TABLE public.med_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  med_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Experiments table
CREATE TABLE public.experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Arm assignments table
CREATE TABLE public.arm_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  arm_name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'system',
  notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sleep_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.naps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arm_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sleep_entries
CREATE POLICY "Users can view their own sleep entries"
  ON public.sleep_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sleep entries"
  ON public.sleep_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep entries"
  ON public.sleep_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep entries"
  ON public.sleep_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for naps
CREATE POLICY "Users can view their own naps"
  ON public.naps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own naps"
  ON public.naps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own naps"
  ON public.naps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own naps"
  ON public.naps FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for check_ins
CREATE POLICY "Users can view their own check-ins"
  ON public.check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
  ON public.check_ins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-ins"
  ON public.check_ins FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for medications
CREATE POLICY "Users can view their own medications"
  ON public.medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medications"
  ON public.medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON public.medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON public.medications FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for med_intakes
CREATE POLICY "Users can view their own med intakes"
  ON public.med_intakes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own med intakes"
  ON public.med_intakes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own med intakes"
  ON public.med_intakes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own med intakes"
  ON public.med_intakes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for experiments
CREATE POLICY "Users can view their own experiments"
  ON public.experiments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own experiments"
  ON public.experiments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiments"
  ON public.experiments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiments"
  ON public.experiments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for arm_assignments
CREATE POLICY "Users can view their own arm assignments"
  ON public.arm_assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own arm assignments"
  ON public.arm_assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own arm assignments"
  ON public.arm_assignments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own arm assignments"
  ON public.arm_assignments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_sleep_entries_user_date ON public.sleep_entries(user_id, date DESC);
CREATE INDEX idx_naps_user_date ON public.naps(user_id, date DESC);
CREATE INDEX idx_check_ins_user_timestamp ON public.check_ins(user_id, timestamp DESC);
CREATE INDEX idx_medications_user ON public.medications(user_id);
CREATE INDEX idx_med_intakes_user_timestamp ON public.med_intakes(user_id, timestamp DESC);
CREATE INDEX idx_experiments_user ON public.experiments(user_id);
CREATE INDEX idx_arm_assignments_user_experiment ON public.arm_assignments(user_id, experiment_id);

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_sleep_entries
  BEFORE UPDATE ON public.sleep_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_naps
  BEFORE UPDATE ON public.naps
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_check_ins
  BEFORE UPDATE ON public.check_ins
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_medications
  BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_med_intakes
  BEFORE UPDATE ON public.med_intakes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_experiments
  BEFORE UPDATE ON public.experiments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_arm_assignments
  BEFORE UPDATE ON public.arm_assignments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_settings
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();