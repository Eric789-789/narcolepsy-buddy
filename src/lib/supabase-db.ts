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
  
  // Map database columns to app interface
  return (data || []).map(row => ({
    id: row.id,
    date: row.date,
    bedtime: row.bedtime || row.bed_time,
    sleep_onset: row.sleep_onset,
    wake_time: row.wake_time,
    sleep_quality: row.quality || 3,
    notes: row.notes,
  }));
}

export async function addSleepEntry(entry: Omit<SleepEntry, 'id'>): Promise<SleepEntry> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const dbEntry = {
    user_id: user.id,
    date: entry.date,
    bed_time: entry.bedtime || '',
    bedtime: entry.bedtime,
    sleep_onset: entry.sleep_onset,
    wake_time: entry.wake_time || '',
    quality: entry.sleep_quality,
    notes: entry.notes,
  };

  const { data, error } = await supabase
    .from('sleep_entries')
    .insert(dbEntry)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    date: data.date,
    bedtime: data.bedtime || data.bed_time,
    sleep_onset: data.sleep_onset,
    wake_time: data.wake_time,
    sleep_quality: data.quality || 3,
    notes: data.notes,
  };
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
  
  return (data || []).map(row => ({
    id: row.id,
    date: row.date,
    start: row.start_time,
    end: row.end_time,
    planned: row.planned || false,
    refreshing: row.refreshing || row.quality || 3,
    notes: row.notes,
  }));
}

export async function addNap(nap: Omit<Nap, 'id'>): Promise<Nap> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const dbEntry = {
    user_id: user.id,
    date: nap.date,
    start_time: nap.start,
    end_time: nap.end,
    planned: nap.planned,
    refreshing: nap.refreshing,
    quality: nap.refreshing,
    notes: nap.notes,
  };

  const { data, error } = await supabase
    .from('naps')
    .insert(dbEntry)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    date: data.date,
    start: data.start_time,
    end: data.end_time,
    planned: data.planned || false,
    refreshing: data.refreshing || data.quality || 3,
    notes: data.notes,
  };
}

// Check-ins
export async function getAllCheckIns(): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(row => ({
    id: row.id,
    timestamp: row.timestamp,
    context: (row.context as CheckIn['context']) || 'Other',
    sss: row.sss || 4,
  }));
}

export async function addCheckIn(checkIn: Omit<CheckIn, 'id'>): Promise<CheckIn> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: user.id,
      timestamp: checkIn.timestamp,
      context: checkIn.context,
      sss: checkIn.sss,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    timestamp: data.timestamp,
    context: (data.context as CheckIn['context']) || 'Other',
    sss: data.sss || 4,
  };
}

// Medications
export async function getAllMedications(): Promise<Medication[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    dose_mg: row.dose_mg,
    schedule_times: row.schedule_times as string[] | undefined,
    as_needed: row.as_needed || false,
  }));
}

export async function addMedication(med: Omit<Medication, 'id'>): Promise<Medication> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const dbEntry = {
    user_id: user.id,
    name: med.name,
    dosage: med.dose_mg?.toString() || '',
    frequency: '',
    start_date: new Date().toISOString().split('T')[0],
    dose_mg: med.dose_mg,
    schedule_times: med.schedule_times,
    as_needed: med.as_needed,
    notes: '',
  };

  const { data, error } = await supabase
    .from('medications')
    .insert(dbEntry)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    dose_mg: data.dose_mg,
    schedule_times: data.schedule_times as string[] | undefined,
    as_needed: data.as_needed || false,
  };
}

// Med Intakes
export async function getAllMedIntakes(): Promise<MedIntake[]> {
  const { data, error } = await supabase
    .from('med_intakes')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(row => ({
    id: row.id,
    medication_id: row.med_id,
    timestamp: row.timestamp,
    dose_mg: row.dose_mg,
    taken: row.taken !== undefined ? row.taken : true,
  }));
}

export async function addMedIntake(intake: Omit<MedIntake, 'id'>): Promise<MedIntake> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const dbEntry = {
    user_id: user.id,
    med_id: intake.medication_id,
    timestamp: intake.timestamp,
    dose_mg: intake.dose_mg,
    taken: intake.taken,
    notes: '',
  };

  const { data, error } = await supabase
    .from('med_intakes')
    .insert(dbEntry)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    medication_id: data.med_id,
    timestamp: data.timestamp,
    dose_mg: data.dose_mg,
    taken: data.taken !== undefined ? data.taken : true,
  };
}

// Experiments
export async function getAllExperiments(): Promise<Experiment[]> {
  const { data, error } = await supabase
    .from('experiments')
    .select('*')
    .order('start_date', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(row => ({
    id: row.id,
    title: row.title || row.name,
    goal: row.goal,
    metric: (row.metric as Experiment['metric']) || 'Midday SSS avg',
    start_date: row.start_date,
    end_date: row.end_date,
    design: 'Block' as const,
    armA_desc: row.arma_desc || '',
    armB_desc: row.armb_desc || '',
  }));
}

export async function addExperiment(exp: Omit<Experiment, 'id'>): Promise<Experiment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const dbEntry = {
    user_id: user.id,
    name: exp.title,
    title: exp.title,
    hypothesis: '',
    goal: exp.goal,
    metric: exp.metric,
    design: exp.design,
    armA_desc: exp.armA_desc,
    armB_desc: exp.armB_desc,
    start_date: exp.start_date,
    end_date: exp.end_date,
    description: exp.goal,
  };

  const { data, error } = await supabase
    .from('experiments')
    .insert(dbEntry)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    title: data.title || data.name,
    goal: data.goal,
    metric: (data.metric as Experiment['metric']) || 'Midday SSS avg',
    start_date: data.start_date,
    end_date: data.end_date,
    design: 'Block' as const,
    armA_desc: data.arma_desc || '',
    armB_desc: data.armb_desc || '',
  };
}

// Arm Assignments
export async function getAllArmAssignments(): Promise<ArmAssignment[]> {
  const { data, error } = await supabase
    .from('arm_assignments')
    .select('*')
    .order('start_date', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(row => ({
    id: row.id,
    experiment_id: row.experiment_id,
    date: row.date || row.start_date,
    arm: (row.arm || (row.arm_name === 'A' ? 'A' : 'B')) as 'A' | 'B',
  }));
}

export async function addArmAssignment(assignment: Omit<ArmAssignment, 'id'>): Promise<ArmAssignment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const dbEntry = {
    user_id: user.id,
    experiment_id: assignment.experiment_id,
    arm_name: assignment.arm,
    arm: assignment.arm,
    date: assignment.date,
    start_date: assignment.date,
    end_date: '',
  };

  const { data, error } = await supabase
    .from('arm_assignments')
    .insert(dbEntry)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    experiment_id: data.experiment_id,
    date: data.date || data.start_date,
    arm: (data.arm || (data.arm_name === 'A' ? 'A' : 'B')) as 'A' | 'B',
  };
}

// Settings
export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .maybeSingle();
  
  if (error) throw error;
  
  if (!data) return null;
  
  return {
    id: data.id,
    timezone: data.timezone || 'America/New_York',
    bedtime_reminder_time: data.bedtime_reminder_time || '22:30',
    bedtime_reminder_enabled: data.bedtime_reminder_enabled !== undefined ? data.bedtime_reminder_enabled : true,
  };
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const dbEntry = {
    user_id: user.id,
    theme: 'system',
    notifications: true,
    timezone: settings.timezone,
    bedtime_reminder_time: settings.bedtime_reminder_time,
    bedtime_reminder_enabled: settings.bedtime_reminder_enabled,
  };

  const { error } = await supabase
    .from('user_settings')
    .upsert(dbEntry);
  
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
