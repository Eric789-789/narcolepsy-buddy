import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  getDB,
  computeTotalSleepMinutes,
  computeNapDuration,
  formatMinutesAsTime,
} from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Copy, Download } from 'lucide-react';

export default function WeeklySummaryPage() {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [startDate, setStartDate] = useState(sevenDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateSummary = async () => {
    setGenerating(true);
    try {
      const db = await getDB();

      // Sleep data
      const allSleep = await db.getAllFromIndex('sleepEntries', 'by-date');
      const sleepInRange = allSleep.filter(
        (s) => s.date >= startDate && s.date <= endDate
      );

      const tstValues = sleepInRange
        .map((s) => computeTotalSleepMinutes(s))
        .filter((v) => v !== null) as number[];
      const avgTST =
        tstValues.length > 0
          ? tstValues.reduce((sum, v) => sum + v, 0) / tstValues.length
          : 0;
      const qualityValues = sleepInRange.map((s) => s.sleep_quality);
      const avgQuality =
        qualityValues.length > 0
          ? qualityValues.reduce((sum, v) => sum + v, 0) / qualityValues.length
          : 0;

      // SSS data
      const allCheckIns = await db.getAll('checkIns');
      const checkInsInRange = allCheckIns.filter((c) => {
        const date = c.timestamp.split('T')[0];
        return date >= startDate && date <= endDate;
      });

      const sssValues = checkInsInRange.map((c) => c.sss);
      const avgSSS =
        sssValues.length > 0
          ? sssValues.reduce((sum, v) => sum + v, 0) / sssValues.length
          : 0;

      const morningSSS = checkInsInRange
        .filter((c) => c.context === 'Morning')
        .map((c) => c.sss);
      const avgMorning =
        morningSSS.length > 0
          ? morningSSS.reduce((sum, v) => sum + v, 0) / morningSSS.length
          : 0;

      const middaySSS = checkInsInRange
        .filter((c) => c.context === 'Midday')
        .map((c) => c.sss);
      const avgMidday =
        middaySSS.length > 0
          ? middaySSS.reduce((sum, v) => sum + v, 0) / middaySSS.length
          : 0;

      const eveningSSS = checkInsInRange
        .filter((c) => c.context === 'Evening')
        .map((c) => c.sss);
      const avgEvening =
        eveningSSS.length > 0
          ? eveningSSS.reduce((sum, v) => sum + v, 0) / eveningSSS.length
          : 0;

      // Nap data
      const allNaps = await db.getAllFromIndex('naps', 'by-date');
      const napsInRange = allNaps.filter(
        (n) => n.date >= startDate && n.date <= endDate
      );
      const napDurations = napsInRange
        .map((n) => computeNapDuration(n))
        .filter((v) => v !== null) as number[];
      const totalNapMinutes = napDurations.reduce((sum, v) => sum + v, 0);

      // Experiment data (if any overlaps)
      const experiments = await db.getAll('experiments');
      const overlapping = experiments.filter(
        (exp) =>
          !(exp.end_date < startDate || exp.start_date > endDate)
      );

      let expText = '';
      if (overlapping.length > 0) {
        const exp = overlapping[0]; // Use first overlapping
        const assignments = await db.getAllFromIndex(
          'armAssignments',
          'by-experiment',
          exp.id
        );

        const armADates = assignments
          .filter((a) => a.arm === 'A' && a.date >= startDate && a.date <= endDate)
          .map((a) => a.date);
        const armBDates = assignments
          .filter((a) => a.arm === 'B' && a.date >= startDate && a.date <= endDate)
          .map((a) => a.date);

        let valA = 0;
        let valB = 0;

        if (exp.metric === 'Midday SSS avg') {
          const armAChecks = checkInsInRange.filter(
            (c) =>
              c.context === 'Midday' &&
              armADates.includes(c.timestamp.split('T')[0])
          );
          valA =
            armAChecks.length > 0
              ? armAChecks.reduce((sum, c) => sum + c.sss, 0) / armAChecks.length
              : 0;

          const armBChecks = checkInsInRange.filter(
            (c) =>
              c.context === 'Midday' &&
              armBDates.includes(c.timestamp.split('T')[0])
          );
          valB =
            armBChecks.length > 0
              ? armBChecks.reduce((sum, c) => sum + c.sss, 0) / armBChecks.length
              : 0;
        } else if (exp.metric === 'Sleep quality avg') {
          const armASleep = sleepInRange.filter((s) => armADates.includes(s.date));
          valA =
            armASleep.length > 0
              ? armASleep.reduce((sum, s) => sum + s.sleep_quality, 0) /
                armASleep.length
              : 0;

          const armBSleep = sleepInRange.filter((s) => armBDates.includes(s.date));
          valB =
            armBSleep.length > 0
              ? armBSleep.reduce((sum, s) => sum + s.sleep_quality, 0) /
                armBSleep.length
              : 0;
        } else {
          // TST (min)
          const armASleep = sleepInRange.filter((s) => armADates.includes(s.date));
          const armATST = armASleep
            .map((s) => computeTotalSleepMinutes(s))
            .filter((v) => v !== null) as number[];
          valA =
            armATST.length > 0
              ? armATST.reduce((sum, v) => sum + v, 0) / armATST.length
              : 0;

          const armBSleep = sleepInRange.filter((s) => armBDates.includes(s.date));
          const armBTST = armBSleep
            .map((s) => computeTotalSleepMinutes(s))
            .filter((v) => v !== null) as number[];
          valB =
            armBTST.length > 0
              ? armBTST.reduce((sum, v) => sum + v, 0) / armBTST.length
              : 0;
        }

        const diff = Math.abs(valA - valB);
        const observation =
          diff >= 0.5 || diff >= 45
            ? `Observation: Arm ${valA > valB ? 'A' : 'B'} showed better results (difference: ${diff.toFixed(1)})`
            : '';

        expText = `Experiment: ${exp.armA_desc} vs ${exp.armB_desc}
- Arm A: ${exp.metric} ${valA.toFixed(1)}
- Arm B: ${exp.metric} ${valB.toFixed(1)}
${observation}`;
      }

      const summaryText = `WEEKLY NARCOLEPSY SNAPSHOT (${startDate} → ${endDate})

Sleep: Avg TST: ${Math.floor(avgTST / 60)}h ${Math.round(avgTST % 60)}m; Avg quality: ${avgQuality.toFixed(1)}/5

SSS: Overall ${avgSSS.toFixed(1)}; Morning ${avgMorning.toFixed(1)}, Midday ${avgMidday.toFixed(1)}, Evening ${avgEvening.toFixed(1)}

Naps: ${napsInRange.length} naps; total ${Math.floor(totalNapMinutes / 60)}h ${Math.round(totalNapMinutes % 60)}m
${expText ? '\n' + expText : ''}`;

      setSummary(summaryText);
      toast({
        title: 'Summary generated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate summary',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: 'Copied to clipboard',
    });
  };

  const exportCSV = async (entity: string) => {
    try {
      const db = await getDB();
      let data: any[] = [];
      let filename = '';

      if (entity === 'sleep') {
        data = await db.getAllFromIndex('sleepEntries', 'by-date');
        filename = 'sleep_entries.csv';
      } else if (entity === 'nap') {
        data = await db.getAllFromIndex('naps', 'by-date');
        filename = 'naps.csv';
      } else if (entity === 'checkin') {
        data = await db.getAll('checkIns');
        filename = 'check_ins.csv';
      } else if (entity === 'med') {
        data = await db.getAll('medIntakes');
        filename = 'med_intakes.csv';
      }

      if (data.length === 0) {
        toast({
          title: 'No data',
          description: 'No data to export',
        });
        return;
      }

      const headers = Object.keys(data[0]).join(',');
      const rows = data.map((row) => Object.values(row).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Exported',
        description: filename,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export CSV',
        variant: 'destructive',
      });
    }
  };

  const exportJSON = async () => {
    try {
      const db = await getDB();
      const allData = {
        sleepEntries: await db.getAll('sleepEntries'),
        naps: await db.getAll('naps'),
        checkIns: await db.getAll('checkIns'),
        medications: await db.getAll('medications'),
        medIntakes: await db.getAll('medIntakes'),
        experiments: await db.getAll('experiments'),
        armAssignments: await db.getAll('armAssignments'),
        settings: await db.getAll('settings'),
      };

      const json = JSON.stringify(allData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'narcolepsy_tracker_full_export.json';
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Exported',
        description: 'Full data exported as JSON',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export JSON',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Weekly Summary</h1>
            <p className="text-muted-foreground">
              Generate summaries and export your data
            </p>
          </div>
        </div>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Generate Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Date</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End Date</Label>
                <Input
                  id="end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={generateSummary}
              disabled={generating}
              className="w-full"
            >
              {generating ? 'Generating...' : 'Build Summary Text'}
            </Button>

            {summary && (
              <div className="space-y-3">
                <Textarea
                  value={summary}
                  readOnly
                  rows={14}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Export individual entities as CSV or all data as JSON
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => exportCSV('sleep')}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Sleep Entries CSV
              </Button>
              <Button
                onClick={() => exportCSV('nap')}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Naps CSV
              </Button>
              <Button
                onClick={() => exportCSV('checkin')}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Check-Ins CSV
              </Button>
              <Button
                onClick={() => exportCSV('med')}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Med Intakes CSV
              </Button>
            </div>

            <Button
              onClick={exportJSON}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Export All Data (JSON)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
