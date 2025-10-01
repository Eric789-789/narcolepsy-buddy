-- Add missing columns to match app requirements

-- Add missing columns to sleep_entries
ALTER TABLE public.sleep_entries 
ADD COLUMN IF NOT EXISTS bedtime TEXT,
ADD COLUMN IF NOT EXISTS sleep_onset TEXT;

-- Add missing columns to naps  
ALTER TABLE public.naps
ADD COLUMN IF NOT EXISTS planned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refreshing INTEGER CHECK (refreshing >= 1 AND refreshing <= 5);

-- Add missing columns to medications
ALTER TABLE public.medications
ADD COLUMN IF NOT EXISTS dose_mg INTEGER,
ADD COLUMN IF NOT EXISTS schedule_times TEXT[],
ADD COLUMN IF NOT EXISTS as_needed BOOLEAN DEFAULT false;

-- Add missing columns to med_intakes
ALTER TABLE public.med_intakes
ADD COLUMN IF NOT EXISTS dose_mg INTEGER,
ADD COLUMN IF NOT EXISTS taken BOOLEAN DEFAULT true;

-- Add missing columns to experiments
ALTER TABLE public.experiments
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS metric TEXT,
ADD COLUMN IF NOT EXISTS design TEXT DEFAULT 'Block',
ADD COLUMN IF NOT EXISTS armA_desc TEXT,
ADD COLUMN IF NOT EXISTS armB_desc TEXT;

-- Add missing columns to arm_assignments
ALTER TABLE public.arm_assignments
ADD COLUMN IF NOT EXISTS date TEXT,
ADD COLUMN IF NOT EXISTS arm TEXT CHECK (arm IN ('A', 'B'));

-- Add missing columns to user_settings
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
ADD COLUMN IF NOT EXISTS bedtime_reminder_time TEXT DEFAULT '22:30',
ADD COLUMN IF NOT EXISTS bedtime_reminder_enabled BOOLEAN DEFAULT true;