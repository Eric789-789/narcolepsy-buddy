-- Create table for custom data points
CREATE TABLE public.custom_data_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_data_points ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own custom data points"
  ON public.custom_data_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom data points"
  ON public.custom_data_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom data points"
  ON public.custom_data_points FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom data points"
  ON public.custom_data_points FOR DELETE
  USING (auth.uid() = user_id);

-- Add selected_data_points column to check_ins table
ALTER TABLE public.check_ins
ADD COLUMN selected_data_points TEXT[] DEFAULT '{}';

-- Add notes column to check_ins if it doesn't exist already
ALTER TABLE public.check_ins
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add trigger for updated_at on custom_data_points
CREATE TRIGGER update_custom_data_points_updated_at
  BEFORE UPDATE ON public.custom_data_points
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();