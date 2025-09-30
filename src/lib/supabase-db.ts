import { supabase } from "@/integrations/supabase/client";

export interface SleepEntry {
  id?: string;
  date: string;
  bedtime?: string;
  sleep_onset?: string;
  wake_time?: string;
  sleep_quality: number;
  notes?: string;
}

export interface Nap {
  id?: string;
  date: string;
  start: string;
  end: string;
  planned: boolean;
  refreshing: number;
  notes?: string;
}

export interface CheckIn {
  id?: string;
  timestamp: string;
  context: 'Morning' | 'Midday' | 'Evening' | 'Other';
  sss: number;
}

export interface Medication {
  id?: string;
  name: string;
  dose_mg?: number;
  schedule_times?: string[];
  as_needed: boolean;
}

export interface MedIntake {
  id?: string;
  medication_id: string;
  timestamp: string;
  dose_mg?: number;
  taken: boolean;
}

export interface Experiment {
  id?: string;
  title: string;
  goal?: string;
  metric: 'Midday SSS avg' | 'Sleep quality avg' | 'TST (min)';
  start_date: string;
  end_date: string;
  design: 'Block';
  armA_desc: string;
  armB_desc: string;
}

export interface ArmAssignment {
  id?: string;
  experiment_id: string;
  date: string;
  arm: 'A' | 'B';
}

export interface Settings {
  id?: string;
  timezone: string;
  bedtime_reminder_time: string;
  bedtime_reminder_enabled: boolean;
}

// Sleep Entries
export async function getAllSleepEntries(): Promise<SleepEntry[]> {
  const { data, error } = await supabase
    .from('sleep_entries')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function addSleepEntry(entry: Omit<SleepEntry, 'id'>): Promise<SleepEntry> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('sleep_entries')
    .insert({ ...entry, user_id: user.id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateSleepEntry(id: string, entry: Partial<SleepEntry>): Promise<void> {
  const { error } = await supabase
    .from('sleep_entries')
    .update(entry)
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteSleepEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('sleep_entries')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Naps
export async function getAllNaps(): Promise<Nap[]> {
  const { data, error } = await supabase
    .from('naps')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function addNap(nap: Omit<Nap, 'id'>): Promise<Nap> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('naps')
    .insert({ ...nap, user_id: user.id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Check-ins
export async function getAllCheckIns(): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function addCheckIn(checkIn: Omit<CheckIn, 'id'>): Promise<CheckIn> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('check_ins')
    .insert({ ...checkIn, user_id: user.id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Medications
export async function getAllMedications(): Promise<Medication[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function addMedication(med: Omit<Medication, 'id'>): Promise<Medication> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('medications')
    .insert({ ...med, user_id: user.id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Med Intakes
export async function getAllMedIntakes(): Promise<MedIntake[]> {
  const { data, error } = await supabase
    .from('med_intakes')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function addMedIntake(intake: Omit<MedIntake, 'id'>): Promise<MedIntake> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('med_intakes')
    .insert({ ...intake, user_id: user.id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Experiments
export async function getAllExperiments(): Promise<Experiment[]> {
  const { data, error } = await supabase
    .from('experiments')
    .select('*')
    .order('start_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function addExperiment(exp: Omit<Experiment, 'id'>): Promise<Experiment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('experiments')
    .insert({ ...exp, user_id: user.id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Arm Assignments
export async function getAllArmAssignments(): Promise<ArmAssignment[]> {
  const { data, error } = await supabase
    .from('arm_assignments')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function addArmAssignment(assignment: Omit<ArmAssignment, 'id'>): Promise<ArmAssignment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('arm_assignments')
    .insert({ ...assignment, user_id: user.id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Settings
export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('user_settings')
    .upsert({ ...settings, user_id: user.id });
  
  if (error) throw error;
}

// Helper functions
export function computeTotalSleepMinutes(entry: SleepEntry): number | null {
  if (!entry.sleep_onset || !entry.wake_time) return null;

  const [onsetH, onsetM] = entry.sleep_onset.split(':').map(Number);
  const [wakeH, wakeM] = entry.wake_time.split(':').map(Number);

  const onsetMinutes = onsetH * 60 + onsetM;
  const wakeMinutes = wakeH * 60 + wakeM;

  const totalMinutes =
    wakeMinutes < onsetMinutes
      ? wakeMinutes + 24 * 60 - onsetMinutes
      : wakeMinutes - onsetMinutes;

  return totalMinutes;
}

export function computeNapDuration(nap: Nap): number | null {
  if (!nap.start || !nap.end) return null;

  const [startH, startM] = nap.start.split(':').map(Number);
  const [endH, endM] = nap.end.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return endMinutes - startMinutes;
}

export function autoDetectContext(hour?: number): CheckIn['context'] {
  const h = hour ?? new Date().getHours();
  if (h < 11) return 'Morning';
  if (h < 16) return 'Midday';
  return 'Evening';
}

export function formatMinutesAsTime(minutes: number | null): string {
  if (minutes === null) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function getLogicalSleepDate(): string {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 12) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
  return now.toISOString().split('T')[0];
}
