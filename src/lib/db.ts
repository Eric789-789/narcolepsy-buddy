import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface SleepEntry {
  id?: number;
  date: string; // YYYY-MM-DD
  bedtime?: string; // HH:MM
  sleep_onset?: string; // HH:MM
  wake_time?: string; // HH:MM
  sleep_quality: number; // 1-5
  notes?: string;
}

export interface Nap {
  id?: number;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  planned: boolean;
  refreshing: number; // 1-5
  notes?: string;
}

export interface CheckIn {
  id?: number;
  timestamp: string; // ISO datetime
  context: 'Morning' | 'Midday' | 'Evening' | 'Other';
  sss: number; // 1-7
}

export interface Medication {
  id?: number;
  name: string;
  dose_mg?: number;
  schedule_times?: string[]; // ["07:30", "13:00"]
  as_needed: boolean;
}

export interface MedIntake {
  id?: number;
  medication_id: number;
  timestamp: string; // ISO datetime
  dose_mg?: number;
  taken: boolean;
}

export interface Experiment {
  id?: number;
  title: string;
  goal?: string;
  metric: 'Midday SSS avg' | 'Sleep quality avg' | 'TST (min)';
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  design: 'Block';
  armA_desc: string;
  armB_desc: string;
}

export interface ArmAssignment {
  id?: number;
  experiment_id: number;
  date: string; // YYYY-MM-DD
  arm: 'A' | 'B';
}

export interface Settings {
  id: number;
  timezone: string;
  bedtime_reminder_time: string; // HH:MM
  bedtime_reminder_enabled: boolean;
}

interface NarcolepsyDB extends DBSchema {
  sleepEntries: {
    key: number;
    value: SleepEntry;
    indexes: { 'by-date': string };
  };
  naps: {
    key: number;
    value: Nap;
    indexes: { 'by-date': string };
  };
  checkIns: {
    key: number;
    value: CheckIn;
    indexes: { 'by-timestamp': string };
  };
  medications: {
    key: number;
    value: Medication;
    indexes: { 'by-name': string };
  };
  medIntakes: {
    key: number;
    value: MedIntake;
    indexes: { 'by-medication': number; 'by-timestamp': string };
  };
  experiments: {
    key: number;
    value: Experiment;
    indexes: { 'by-start-date': string };
  };
  armAssignments: {
    key: number;
    value: ArmAssignment;
    indexes: { 'by-experiment': number; 'by-date': string };
  };
  settings: {
    key: number;
    value: Settings;
  };
}

let dbInstance: IDBPDatabase<NarcolepsyDB> | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<NarcolepsyDB>('narcolepsy-tracker', 1, {
    upgrade(db) {
      // Sleep Entries
      const sleepStore = db.createObjectStore('sleepEntries', {
        keyPath: 'id',
        autoIncrement: true,
      });
      sleepStore.createIndex('by-date', 'date');

      // Naps
      const napStore = db.createObjectStore('naps', {
        keyPath: 'id',
        autoIncrement: true,
      });
      napStore.createIndex('by-date', 'date');

      // Check-ins
      const checkInStore = db.createObjectStore('checkIns', {
        keyPath: 'id',
        autoIncrement: true,
      });
      checkInStore.createIndex('by-timestamp', 'timestamp');

      // Medications
      const medStore = db.createObjectStore('medications', {
        keyPath: 'id',
        autoIncrement: true,
      });
      medStore.createIndex('by-name', 'name');

      // Med Intakes
      const intakeStore = db.createObjectStore('medIntakes', {
        keyPath: 'id',
        autoIncrement: true,
      });
      intakeStore.createIndex('by-medication', 'medication_id');
      intakeStore.createIndex('by-timestamp', 'timestamp');

      // Experiments
      const expStore = db.createObjectStore('experiments', {
        keyPath: 'id',
        autoIncrement: true,
      });
      expStore.createIndex('by-start-date', 'start_date');

      // Arm Assignments
      const armStore = db.createObjectStore('armAssignments', {
        keyPath: 'id',
        autoIncrement: true,
      });
      armStore.createIndex('by-experiment', 'experiment_id');
      armStore.createIndex('by-date', 'date');

      // Settings
      db.createObjectStore('settings', {
        keyPath: 'id',
        autoIncrement: true,
      });
    },
  });

  // Initialize settings if not exists
  const settingsCount = await dbInstance.count('settings');
  if (settingsCount === 0) {
    await dbInstance.add('settings', {
      id: 1,
      timezone: 'America/New_York',
      bedtime_reminder_time: '22:30',
      bedtime_reminder_enabled: true,
    });
  }

  return dbInstance;
}

// Computed fields
export function computeTotalSleepMinutes(entry: SleepEntry): number | null {
  if (!entry.sleep_onset || !entry.wake_time) return null;

  const [onsetH, onsetM] = entry.sleep_onset.split(':').map(Number);
  const [wakeH, wakeM] = entry.wake_time.split(':').map(Number);

  const onsetMinutes = onsetH * 60 + onsetM;
  const wakeMinutes = wakeH * 60 + wakeM;

  // If wake time is before sleep onset, add 24 hours (next day)
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
  // If before noon, logical sleep date is yesterday
  if (hour < 12) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
  return now.toISOString().split('T')[0];
}
