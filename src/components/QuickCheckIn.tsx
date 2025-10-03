import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { addCheckIn, autoDetectContext, CheckIn, getAllCustomDataPoints, CustomDataPoint } from '@/lib/supabase-db';
import { toast } from '@/hooks/use-toast';
import DataPointsManager from './DataPointsManager';

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
  const [notes, setNotes] = useState('');
  const [dataPoints, setDataPoints] = useState<CustomDataPoint[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDataPoints();
  }, []);

  const loadDataPoints = async () => {
    try {
      const points = await getAllCustomDataPoints();
      setDataPoints(points);
    } catch (error) {
      console.error('Failed to load data points:', error);
    }
  };

  const toggleDataPoint = (pointName: string) => {
    setSelectedPoints((prev) =>
      prev.includes(pointName)
        ? prev.filter((p) => p !== pointName)
        : [...prev, pointName]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await addCheckIn({
        timestamp: new Date().toISOString(),
        context,
        sss,
        notes,
        selected_data_points: selectedPoints,
      });
      toast({
        title: 'Check-in saved',
        description: `SSS: ${sss} (${context})`,
      });
      setNotes('');
      setSelectedPoints([]);
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

        <div className="space-y-3">
          <Label>Additional Tracking Data</Label>
          <DropdownMenu onOpenChange={() => loadDataPoints()}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedPoints.length > 0
                  ? `${selectedPoints.length} item${selectedPoints.length > 1 ? 's' : ''} selected`
                  : 'Select data points'}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
              {dataPoints.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No data points yet
                </div>
              ) : (
                dataPoints.map((point) => (
                  <div
                    key={point.id}
                    className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-accent"
                    onClick={() => toggleDataPoint(point.name)}
                  >
                    <Checkbox
                      checked={selectedPoints.includes(point.name)}
                      onCheckedChange={() => toggleDataPoint(point.name)}
                    />
                    <span className="text-sm">{point.name}</span>
                  </div>
                ))
              )}
              <DropdownMenuSeparator />
              <DataPointsManager />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional observations..."
            rows={3}
          />
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
