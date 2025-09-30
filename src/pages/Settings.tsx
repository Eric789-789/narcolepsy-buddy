import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getDB, Settings as SettingsType } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Download } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [timezone, setTimezone] = useState('America/New_York');
  const [reminderTime, setReminderTime] = useState('22:30');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    const db = await getDB();
    const allSettings = await db.getAll('settings');
    if (allSettings.length > 0) {
      const s = allSettings[0];
      setSettings(s);
      setTimezone(s.timezone);
      setReminderTime(s.bedtime_reminder_time);
      setReminderEnabled(s.bedtime_reminder_enabled);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const db = await getDB();
      await db.put('settings', {
        ...settings,
        timezone,
        bedtime_reminder_time: reminderTime,
        bedtime_reminder_enabled: reminderEnabled,
      });
      toast({
        title: 'Settings saved',
      });
      loadSettings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const downloadICS = () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Narcolepsy Tracker//EN
BEGIN:VEVENT
UID:bedtime-reminder@narcolepsy-tracker
DTSTART:20250101T${reminderTime.replace(':', '')}00
RRULE:FREQ=DAILY
SUMMARY:Bedtime – Log Sleep
DESCRIPTION:Time to prepare for bed and log yesterday's sleep
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Bedtime Reminder
TRIGGER:-PT10M
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bedtime_reminder.ics';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: 'bedtime_reminder.ics',
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Configure your preferences and reminders
            </p>
          </div>
        </div>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g., America/New_York"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Bedtime Reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder-enabled">Enable Reminder</Label>
              <Switch
                id="reminder-enabled"
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-time">Reminder Time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>

            <Button
              onClick={downloadICS}
              variant="outline"
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Download Bedtime Reminder (.ics)
            </Button>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
