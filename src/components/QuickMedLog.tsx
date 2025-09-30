import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getDB, Medication } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface QuickMedLogProps {
  onSaved?: () => void;
}

export default function QuickMedLog({ onSaved }: QuickMedLogProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [doseMg, setDoseMg] = useState<string>('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [saving, setSaving] = useState(false);

  // New med dialog
  const [showNewMed, setShowNewMed] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [addingMed, setAddingMed] = useState(false);

  const loadMedications = async () => {
    const db = await getDB();
    const meds = await db.getAll('medications');
    setMedications(meds);
  };

  useEffect(() => {
    loadMedications();
  }, []);

  useEffect(() => {
    if (selectedMedId) {
      const med = medications.find((m) => m.id?.toString() === selectedMedId);
      if (med?.dose_mg) {
        setDoseMg(med.dose_mg.toString());
      }
    }
  }, [selectedMedId, medications]);

  const handleAddMedication = async () => {
    if (!newMedName.trim()) return;
    setAddingMed(true);
    try {
      const db = await getDB();
      const id = await db.add('medications', {
        name: newMedName.trim(),
        dose_mg: newMedDose ? parseFloat(newMedDose) : undefined,
        as_needed: false,
      });
      await loadMedications();
      setSelectedMedId(id.toString());
      setShowNewMed(false);
      setNewMedName('');
      setNewMedDose('');
      toast({
        title: 'Medication added',
        description: newMedName,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add medication',
        variant: 'destructive',
      });
    } finally {
      setAddingMed(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMedId) {
      toast({
        title: 'Error',
        description: 'Please select a medication',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const db = await getDB();
      await db.add('medIntakes', {
        medication_id: parseInt(selectedMedId),
        timestamp: new Date(timestamp).toISOString(),
        dose_mg: doseMg ? parseFloat(doseMg) : undefined,
        taken: true,
      });
      toast({
        title: 'Intake logged',
        description: medications.find((m) => m.id?.toString() === selectedMedId)?.name,
      });
      onSaved?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log intake',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle>Log Medication Intake</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Medication</Label>
          <div className="flex gap-2">
            <Select value={selectedMedId} onValueChange={setSelectedMedId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                {medications.map((med) => (
                  <SelectItem key={med.id} value={med.id!.toString()}>
                    {med.name}
                    {med.dose_mg && ` (${med.dose_mg} mg)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={showNewMed} onOpenChange={setShowNewMed}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Medication</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-name">Name</Label>
                    <Input
                      id="med-name"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      placeholder="e.g., Modafinil"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-dose">Default Dose (mg, optional)</Label>
                    <Input
                      id="med-dose"
                      type="number"
                      value={newMedDose}
                      onChange={(e) => setNewMedDose(e.target.value)}
                      placeholder="e.g., 200"
                    />
                  </div>
                  <Button
                    onClick={handleAddMedication}
                    disabled={addingMed || !newMedName.trim()}
                    className="w-full"
                  >
                    {addingMed ? 'Adding...' : 'Add Medication'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dose">Dose (mg, optional)</Label>
          <Input
            id="dose"
            type="number"
            value={doseMg}
            onChange={(e) => setDoseMg(e.target.value)}
            placeholder="e.g., 200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timestamp">Time Taken</Label>
          <Input
            id="timestamp"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !selectedMedId}
          className="w-full h-12 text-lg"
        >
          {saving ? 'Saving...' : 'Log Intake'}
        </Button>
      </CardContent>
    </Card>
  );
}
