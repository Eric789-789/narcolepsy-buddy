import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { getDB, Experiment } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, TrendingUp } from 'lucide-react';

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [showNewExp, setShowNewExp] = useState(false);

  // New experiment form
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [metric, setMetric] = useState<Experiment['metric']>('Midday SSS avg');
  const [duration, setDuration] = useState<7 | 14>(7);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [armA, setArmA] = useState('');
  const [armB, setArmB] = useState('');
  const [creating, setCreating] = useState(false);

  const loadExperiments = async () => {
    const db = await getDB();
    const exps = await db.getAll('experiments');
    setExperiments(exps.sort((a, b) => b.start_date.localeCompare(a.start_date)));
  };

  useEffect(() => {
    loadExperiments();
  }, []);

  const handleCreateExperiment = async () => {
    if (!title.trim() || !armA.trim() || !armB.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const db = await getDB();
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + duration - 1);

      const expId = await db.add('experiments', {
        title: title.trim(),
        goal: goal.trim() || undefined,
        metric,
        start_date: startDate,
        end_date: end.toISOString().split('T')[0],
        design: 'Block',
        armA_desc: armA.trim(),
        armB_desc: armB.trim(),
      });

      // Generate arm assignments
      const assignments = [];
      if (duration === 7) {
        // Days 1-4: A, Days 5-7: B
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          assignments.push({
            experiment_id: expId as number,
            date: d.toISOString().split('T')[0],
            arm: (i < 4 ? 'A' : 'B') as 'A' | 'B',
          });
        }
      } else {
        // Days 1-7: A, Days 8-14: B
        for (let i = 0; i < 14; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          assignments.push({
            experiment_id: expId as number,
            date: d.toISOString().split('T')[0],
            arm: (i < 7 ? 'A' : 'B') as 'A' | 'B',
          });
        }
      }

      for (const assignment of assignments) {
        await db.add('armAssignments', assignment);
      }

      toast({
        title: 'Experiment created',
        description: `${title} (${duration} days)`,
      });

      setShowNewExp(false);
      setTitle('');
      setGoal('');
      setArmA('');
      setArmB('');
      loadExperiments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create experiment',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Experiments</h1>
            <p className="text-muted-foreground">
              Run Block A/B experiments to test interventions
            </p>
          </div>
          <Dialog open={showNewExp} onOpenChange={setShowNewExp}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Start New Experiment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Block A/B Experiment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="exp-title">Title *</Label>
                  <Input
                    id="exp-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Bedtime Consistency Test"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exp-goal">Goal (optional)</Label>
                  <Textarea
                    id="exp-goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="What are you testing?"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Metric</Label>
                    <Select
                      value={metric}
                      onValueChange={(v) => setMetric(v as Experiment['metric'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Midday SSS avg">Midday SSS avg</SelectItem>
                        <SelectItem value="Sleep quality avg">Sleep quality avg</SelectItem>
                        <SelectItem value="TST (min)">TST (min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select
                      value={duration.toString()}
                      onValueChange={(v) => setDuration(parseInt(v) as 7 | 14)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days (4A + 3B)</SelectItem>
                        <SelectItem value="14">14 days (7A + 7B)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exp-start">Start Date</Label>
                  <Input
                    id="exp-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arm-a">Arm A Description *</Label>
                  <Input
                    id="arm-a"
                    value={armA}
                    onChange={(e) => setArmA(e.target.value)}
                    placeholder="e.g., Bedtime at 22:30 sharp"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arm-b">Arm B Description *</Label>
                  <Input
                    id="arm-b"
                    value={armB}
                    onChange={(e) => setArmB(e.target.value)}
                    placeholder="e.g., Flexible bedtime (22:00-23:00)"
                  />
                </div>

                <Button
                  onClick={handleCreateExperiment}
                  disabled={creating}
                  className="w-full"
                >
                  {creating ? 'Creating...' : 'Create Experiment'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {experiments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No experiments yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your first Block A/B experiment to test interventions
                </p>
                <Button onClick={() => setShowNewExp(true)}>
                  Create Experiment
                </Button>
              </CardContent>
            </Card>
          ) : (
            experiments.map((exp) => {
              const isActive = exp.start_date <= today && exp.end_date >= today;
              const isPast = exp.end_date < today;
              const isFuture = exp.start_date > today;

              return (
                <Card
                  key={exp.id}
                  className={`shadow-[var(--shadow-card)] ${
                    isActive ? 'border-primary border-2' : ''
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {exp.title}
                      {isActive && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                      {isPast && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          Completed
                        </span>
                      )}
                      {isFuture && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          Upcoming
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {exp.goal && (
                      <p className="text-sm text-muted-foreground">{exp.goal}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">Arm A</p>
                        <p className="text-muted-foreground">{exp.armA_desc}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Arm B</p>
                        <p className="text-muted-foreground">{exp.armB_desc}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>
                        <strong>Metric:</strong> {exp.metric}
                      </span>
                      <span>
                        <strong>Dates:</strong> {exp.start_date} → {exp.end_date}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
