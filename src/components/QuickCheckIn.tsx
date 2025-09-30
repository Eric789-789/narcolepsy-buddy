import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { getDB, autoDetectContext, CheckIn } from '@/lib/db';
import { toast } from '@/hooks/use-toast';

const SSS_LABELS = [
  'Feeling active, vital, alert, wide awake',
  'Functioning at high levels, but not at peak',
  'Awake, but relaxed; responsive but not fully alert',
  'Somewhat foggy, let down',
  'Foggy; losing interest; slowed down',
  'Sleepy, woozy, fighting sleep; prefer to lie down',
  'No longer fighting sleep, soon start to dream',
];

interface QuickCheckInProps {
  onSaved?: () => void;
}

export default function QuickCheckIn({ onSaved }: QuickCheckInProps) {
  const [sss, setSss] = useState(4);
  const [context, setContext] = useState<CheckIn['context']>(autoDetectContext());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const db = await getDB();
      await db.add('checkIns', {
        timestamp: new Date().toISOString(),
        context,
        sss,
      });
      toast({
        title: 'Check-in saved',
        description: `SSS: ${sss} (${context})`,
      });
      onSaved?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save check-in',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle>Stanford Sleepiness Scale Check-In</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium">Context</label>
          <div className="grid grid-cols-4 gap-2">
            {(['Morning', 'Midday', 'Evening', 'Other'] as const).map((ctx) => (
              <Button
                key={ctx}
                variant={context === ctx ? 'default' : 'outline'}
                onClick={() => setContext(ctx)}
                className="h-12"
              >
                {ctx}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <label className="text-sm font-medium">Sleepiness Level</label>
            <span className="text-3xl font-bold text-primary">{sss}</span>
          </div>
          <Slider
            value={[sss]}
            onValueChange={(v) => setSss(v[0])}
            min={1}
            max={7}
            step={1}
            className="py-4"
          />
          <p className="text-sm text-muted-foreground min-h-[2.5rem]">
            {SSS_LABELS[sss - 1]}
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 text-lg"
          size="lg"
        >
          {saving ? 'Saving...' : 'Save Check-In'}
        </Button>
      </CardContent>
    </Card>
  );
}
