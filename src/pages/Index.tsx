import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getAllSleepEntries,
  getAllNaps,
  getAllCheckIns,
  getAllExperiments,
  getAllArmAssignments,
  computeTotalSleepMinutes,
  computeNapDuration,
  formatMinutesAsTime,
  SleepEntry,
  Nap,
  CheckIn,
  ArmAssignment,
  Experiment,
} from '@/lib/supabase-db';
import QuickCheckIn from '@/components/QuickCheckIn';
import QuickSleepLog from '@/components/QuickSleepLog';
import QuickNapLog from '@/components/QuickNapLog';
import QuickMedLog from '@/components/QuickMedLog';
import { UserMenu } from '@/components/UserMenu';
import {
  Activity,
  Moon,
  Coffee,
  Pill,
  TrendingUp,
  LineChart,
  FileText,
  FlaskConical,
  Database,
  Settings as SettingsIcon,
} from 'lucide-react';

type QuickFormType = 'checkin' | 'sleep' | 'nap' | 'med' | null;

export default function Index() {
  const [activeForm, setActiveForm] = useState<QuickFormType>(null);
  
  // Dashboard stats
  const [lastTST, setLastTST] = useState<string>('—');
  const [todayNaps, setTodayNaps] = useState<string>('—');
  const [latestSSS, setLatestSSS] = useState<string>('—');
  const [avgSSS7d, setAvgSSS7d] = useState<number[]>([]);
  const [tst7d, setTst7d] = useState<number[]>([]);
  
  // Active experiment
  const [todayArm, setTodayArm] = useState<{ arm: 'A' | 'B'; experiment: Experiment } | null>(null);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Last night TST
      const sleepEntries = await getAllSleepEntries();
      if (sleepEntries.length > 0) {
        const tst = computeTotalSleepMinutes(sleepEntries[0]);
        setLastTST(formatMinutesAsTime(tst));
      }

      // Today's naps
      const allNaps = await getAllNaps();
      const todayNapsList = allNaps.filter((n) => n.date === today);
      const totalNapMinutes = todayNapsList.reduce((sum, n) => {
        const dur = computeNapDuration(n);
        return sum + (dur ?? 0);
      }, 0);
      setTodayNaps(formatMinutesAsTime(totalNapMinutes));

      // Latest SSS
      const checkIns = await getAllCheckIns();
      if (checkIns.length > 0) {
        setLatestSSS(checkIns[0].sss.toString());
      }

      // Last 7 days avg SSS
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });

      const avgByDay = last7Days.map((date) => {
        const dayCheckIns = checkIns.filter((c) =>
          c.timestamp.startsWith(date)
        );
        if (dayCheckIns.length === 0) return 0;
        const avg =
          dayCheckIns.reduce((sum, c) => sum + c.sss, 0) / dayCheckIns.length;
        return Math.round(avg * 10) / 10;
      });
      setAvgSSS7d(avgByDay);

      // Last 7 nights TST
      const tstByDay = last7Days.map((date) => {
        const entry = sleepEntries.find((e) => e.date === date);
        if (!entry) return 0;
        const tst = computeTotalSleepMinutes(entry);
        return tst ?? 0;
      });
      setTst7d(tstByDay);

      // Check active experiment
      const experiments = await getAllExperiments();
      const active = experiments.find(
        (exp) => exp.start_date <= today && exp.end_date >= today
      );
      if (active && active.id) {
        const assignments = await getAllArmAssignments();
        const expAssignments = assignments.filter(a => a.experiment_id === active.id);
        const todayAssignment = expAssignments.find((a) => a.date === today);
        if (todayAssignment) {
          setTodayArm({ arm: todayAssignment.arm, experiment: active });
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleFormSaved = () => {
    setActiveForm(null);
    loadDashboardData();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Narcolepsy Tracker
            </h1>
            <p className="text-lg text-muted-foreground">
              Fast logging and A/B experimentation for better sleep management
            </p>
          </div>
          <UserMenu />
        </header>

        {/* Active Experiment Banner */}
        {todayArm && (
          <Card className="border-primary bg-primary/5 shadow-[var(--shadow-elevated)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                Active Experiment: {todayArm.experiment.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Today's Arm: <span className="text-2xl font-bold text-primary">{todayArm.arm}</span></p>
                  <p className="text-sm text-muted-foreground">
                    {todayArm.arm === 'A'
                      ? todayArm.experiment.armA_desc
                      : todayArm.experiment.armB_desc}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/experiments">View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Action Cards */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              className="cursor-pointer hover:shadow-[var(--shadow-elevated)] transition-all hover:scale-[1.02] border-2 hover:border-primary"
              onClick={() => setActiveForm('checkin')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Activity className="h-6 w-6" />
                  Check In (SSS)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Quick Stanford Sleepiness Scale check-in
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-[var(--shadow-elevated)] transition-all hover:scale-[1.02] border-2 hover:border-primary"
              onClick={() => setActiveForm('sleep')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Moon className="h-6 w-6" />
                  Log Sleep
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Record last night's sleep details
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-[var(--shadow-elevated)] transition-all hover:scale-[1.02] border-2 hover:border-secondary"
              onClick={() => setActiveForm('nap')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <Coffee className="h-6 w-6" />
                  Log Nap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track nap duration and quality
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-[var(--shadow-elevated)] transition-all hover:scale-[1.02] border-2 hover:border-accent"
              onClick={() => setActiveForm('med')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Pill className="h-6 w-6" />
                  Log Med
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Record medication intake
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Today's Stats */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Today / Recent</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Moon className="h-5 w-5 text-primary" />
                  Last Night TST
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{lastTST}</p>
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-secondary" />
                  Today's Naps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-secondary">{todayNaps}</p>
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  Latest SSS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">{latestSSS}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mini Charts */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Last 7 Days</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="text-lg">Average SSS by Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end gap-2">
                  {avgSSS7d.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-primary rounded-t transition-all"
                        style={{ height: `${(val / 7) * 100}%`, minHeight: val > 0 ? '4px' : '0' }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {val > 0 ? val : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="text-lg">Total Sleep Time (minutes)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end gap-2">
                  {tst7d.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-secondary rounded-t transition-all"
                        style={{ height: `${(val / 600) * 100}%`, minHeight: val > 0 ? '4px' : '0' }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {val > 0 ? Math.round(val / 60) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Navigation Links */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">More</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button asChild variant="outline" className="h-16 flex flex-col gap-1">
              <Link to="/experiments">
                <FlaskConical className="h-5 w-5" />
                <span className="text-sm">Experiments</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col gap-1">
              <Link to="/summary">
                <FileText className="h-5 w-5" />
                <span className="text-sm">Summary</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col gap-1">
              <Link to="/graphs">
                <LineChart className="h-5 w-5" />
                <span className="text-sm">Graphs</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col gap-1">
              <Link to="/data">
                <Database className="h-5 w-5" />
                <span className="text-sm">Data</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col gap-1">
              <Link to="/settings">
                <SettingsIcon className="h-5 w-5" />
                <span className="text-sm">Settings</span>
              </Link>
            </Button>
          </div>
        </section>
      </div>

      {/* Quick Form Dialog */}
      <Dialog open={activeForm !== null} onOpenChange={() => setActiveForm(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeForm === 'checkin' && 'Quick Check-In'}
              {activeForm === 'sleep' && 'Quick Sleep Log'}
              {activeForm === 'nap' && 'Quick Nap Log'}
              {activeForm === 'med' && 'Quick Med Log'}
            </DialogTitle>
          </DialogHeader>
          {activeForm === 'checkin' && <QuickCheckIn onSaved={handleFormSaved} />}
          {activeForm === 'sleep' && <QuickSleepLog onSaved={handleFormSaved} />}
          {activeForm === 'nap' && <QuickNapLog onSaved={handleFormSaved} />}
          {activeForm === 'med' && <QuickMedLog onSaved={handleFormSaved} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
