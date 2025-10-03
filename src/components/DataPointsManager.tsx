import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Settings, X } from 'lucide-react';
import { getAllCustomDataPoints, addCustomDataPoint, deleteCustomDataPoint, CustomDataPoint } from '@/lib/supabase-db';
import { toast } from '@/hooks/use-toast';

export default function DataPointsManager() {
  const [dataPoints, setDataPoints] = useState<CustomDataPoint[]>([]);
  const [newPointName, setNewPointName] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadDataPoints();
    }
  }, [open]);

  const loadDataPoints = async () => {
    try {
      const points = await getAllCustomDataPoints();
      setDataPoints(points);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data points',
        variant: 'destructive',
      });
    }
  };

  const handleAdd = async () => {
    if (!newPointName.trim()) return;
    
    setLoading(true);
    try {
      await addCustomDataPoint(newPointName.trim());
      setNewPointName('');
      await loadDataPoints();
      toast({
        title: 'Data point added',
        description: newPointName,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add data point',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomDataPoint(id);
      await loadDataPoints();
      toast({
        title: 'Data point deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete data point',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 font-normal">
          <Settings className="h-4 w-4" />
          Manage Data Points
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Tracking Data Points</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-point">Add New Data Point</Label>
            <div className="flex gap-2">
              <Input
                id="new-point"
                value={newPointName}
                onChange={(e) => setNewPointName(e.target.value)}
                placeholder="e.g., A/B Test Arm A, Took Medication"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Button onClick={handleAdd} disabled={loading || !newPointName.trim()}>
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Data Points</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {dataPoints.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No data points yet. Add your first one above.
                </p>
              ) : (
                dataPoints.map((point) => (
                  <div
                    key={point.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted"
                  >
                    <span className="text-sm">{point.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => point.id && handleDelete(point.id)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
