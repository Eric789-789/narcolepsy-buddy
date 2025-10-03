import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { addSleepEntry, getLogicalSleepDate } from '@/lib/supabase-db';
import { toast } from '@/hooks/use-toast';

interface QuickSleepLogProps {
  onSaved?: () => void;
}

const qualityDescriptions = {
  1: 'Very Poor - Unable to function, felt exhausted all day',
  2: 'Poor - Tired and groggy, struggled to stay alert',
  3: 'Fair - Somewhat rested but not optimal',
  4: 'Good - Well rested, felt alert throughout the day',
  5: 'Excellent - Fully refreshed, peak alertness and energy'
};

export default function QuickSleepLog({ onSaved }: QuickSleepLogProps) {
  const [date, setDate] = useState(getLogicalSleepDate());
  const [bedtime, setBedtime] = useState('');
  const [sleepOnsetMinutes, setSleepOnsetMinutes] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!bedtime || !wakeTime) {
      toast({
        title: 'Required fields missing',
        description: 'Please enter bedtime and wake time',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Convert minutes to HH:MM format if provided
      let sleepOnsetTime: string | undefined;
      if (sleepOnsetMinutes) {
        const minutes = parseInt(sleepOnsetMinutes);
        if (!isNaN(minutes) && minutes >= 0) {
          // Add minutes to bedtime to get sleep onset time
          const [bedHours, bedMins] = bedtime.split(':').map(Number);
          const bedtimeDate = new Date();
          bedtimeDate.setHours(bedHours, bedMins, 0, 0);
          bedtimeDate.setMinutes(bedtimeDate.getMinutes() + minutes);
          sleepOnsetTime = bedtimeDate.toTimeString().slice(0, 5);
        }
      }

      await addSleepEntry({
        date,
        bedtime,
        sleep_onset: sleepOnsetTime,
        wake_time: wakeTime,
        sleep_quality: quality,
        notes: notes || undefined,
      });
      toast({
        title: 'Sleep entry saved',
        description: `Date: ${date}`,
      });
      onSaved?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save sleep entry',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle>Log Sleep</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Sleep Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="bedtime">Bedtime *</Label>
            <Input
              id="bedtime"
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wake">Wake Time *</Label>
            <Input
              id="wake"
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="onset">Sleep Onset (minutes to fall asleep)</Label>
          <Input
            id="onset"
            type="number"
            min="0"
            placeholder="e.g., 20"
            value={sleepOnsetMinutes}
            onChange={(e) => setSleepOnsetMinutes(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <Label>Sleep Quality</Label>
            <span className="text-2xl font-bold text-primary">{quality}/5</span>
          </div>
          <Slider
            value={[quality]}
            onValueChange={(v) => setQuality(v[0])}
            min={1}
            max={5}
            step={1}
            className="py-2"
          />
          <p className="text-sm text-muted-foreground">
            {qualityDescriptions[quality as keyof typeof qualityDescriptions]}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations..."
            rows={2}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 text-lg"
        >
          {saving ? 'Saving...' : 'Save Sleep Entry'}
        </Button>
      </CardContent>
    </Card>
  );
}
