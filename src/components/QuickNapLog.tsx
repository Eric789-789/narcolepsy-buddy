import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getDB } from '@/lib/db';
import { toast } from '@/hooks/use-toast';

interface QuickNapLogProps {
  onSaved?: () => void;
}

export default function QuickNapLog({ onSaved }: QuickNapLogProps) {
  const now = new Date();
  const endTime = new Date(now.getTime() + 20 * 60000); // +20 minutes

  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [start, setStart] = useState(
    now.toTimeString().slice(0, 5)
  );
  const [end, setEnd] = useState(
    endTime.toTimeString().slice(0, 5)
  );
  const [planned, setPlanned] = useState(false);
  const [refreshing, setRefreshing] = useState(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const db = await getDB();
      await db.add('naps', {
        date,
        start,
        end,
        planned,
        refreshing,
        notes: notes || undefined,
      });
      toast({
        title: 'Nap logged',
        description: `${start} to ${end}`,
      });
      onSaved?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save nap',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle>Log Nap</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nap-date">Date</Label>
          <Input
            id="nap-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="start">Start Time</Label>
            <Input
              id="start"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">End Time</Label>
            <Input
              id="end"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="planned">Planned Nap</Label>
          <Switch
            id="planned"
            checked={planned}
            onCheckedChange={setPlanned}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <Label>How Refreshing</Label>
            <span className="text-2xl font-bold text-secondary">{refreshing}/5</span>
          </div>
          <Slider
            value={[refreshing]}
            onValueChange={(v) => setRefreshing(v[0])}
            min={1}
            max={5}
            step={1}
            className="py-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nap-notes">Notes (optional)</Label>
          <Textarea
            id="nap-notes"
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
          {saving ? 'Saving...' : 'Save Nap'}
        </Button>
      </CardContent>
    </Card>
  );
}
