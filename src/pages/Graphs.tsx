import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { getDB, computeTotalSleepMinutes, computeNapDuration } from '@/lib/db';
import { getAllCheckIns, getAllCustomDataPoints, getAllMedications } from '@/lib/supabase-db';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type TimeRange = '1d' | '2d' | '3d' | '7d' | '30d' | '6m' | '1y' | 'all';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(142, 76%, 36%)',
  'hsl(346, 77%, 50%)',
  'hsl(262, 83%, 58%)',
];

export default function GraphsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [checkInData, setCheckInData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [napData, setNapData] = useState<any[]>([]);
  const [medData, setMedData] = useState<any[]>([]);
  
  const [customDataPoints, setCustomDataPoints] = useState<string[]>([]);
  const [selectedDataPoints, setSelectedDataPoints] = useState<string[]>([]);
  
  const [medications, setMedications] = useState<any[]>([]);
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case '1d':
        start.setDate(end.getDate() - 1);
        break;
      case '2d':
        start.setDate(end.getDate() - 2);
        break;
      case '3d':
        start.setDate(end.getDate() - 3);
        break;
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '6m':
        start.setMonth(end.getMonth() - 6);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
      case 'all':
        start.setFullYear(2000);
        break;
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const loadData = async () => {
    const { start, end } = getDateRange();
    const db = await getDB();

    // Load custom data points
    const dataPoints = await getAllCustomDataPoints();
    const dpNames = dataPoints.map(dp => dp.name);
    setCustomDataPoints(dpNames);
    if (selectedDataPoints.length === 0 && dpNames.length > 0) {
      setSelectedDataPoints([dpNames[0]]);
    }

    // Load medications
    const meds = await getAllMedications();
    setMedications(meds);
    if (selectedMeds.length === 0 && meds.length > 0) {
      setSelectedMeds([meds[0].id]);
    }

    // Load check-ins
    const allCheckIns = await getAllCheckIns();
    const checkInsInRange = allCheckIns.filter((c) => {
      const date = c.timestamp.split('T')[0];
      return date >= start && date <= end;
    });

    // Group by date and calculate averages
    const checkInsByDate = new Map<string, { sss: number[], dataPoints: Map<string, number> }>();
    checkInsInRange.forEach((c) => {
      const date = c.timestamp.split('T')[0];
      if (!checkInsByDate.has(date)) {
        checkInsByDate.set(date, { sss: [], dataPoints: new Map() });
      }
      const entry = checkInsByDate.get(date)!;
      entry.sss.push(c.sss);
      
      c.selected_data_points?.forEach(dp => {
        entry.dataPoints.set(dp, (entry.dataPoints.get(dp) || 0) + 1);
      });
    });

    const checkInChartData = Array.from(checkInsByDate.entries()).map(([date, data]) => {
      const result: any = {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        avgSSS: data.sss.reduce((a, b) => a + b, 0) / data.sss.length
      };
      
      // Add counts for each selected data point
      selectedDataPoints.forEach(dp => {
        result[dp] = data.dataPoints.get(dp) || 0;
      });
      
      return result;
    }).sort((a, b) => a.date.localeCompare(b.date));

    setCheckInData(checkInChartData);

    // Load sleep data
    const allSleep = await db.getAllFromIndex('sleepEntries', 'by-date');
    const sleepInRange = allSleep.filter((s) => s.date >= start && s.date <= end);
    const sleepChartData = sleepInRange.map((s) => ({
      date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tst: computeTotalSleepMinutes(s) || 0,
      quality: s.sleep_quality || 0
    })).sort((a, b) => a.date.localeCompare(b.date));
    setSleepData(sleepChartData);

    // Load nap data
    const allNaps = await db.getAllFromIndex('naps', 'by-date');
    const napsInRange = allNaps.filter((n) => n.date >= start && n.date <= end);
    const napChartData = napsInRange.map((n) => ({
      date: new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      duration: computeNapDuration(n) || 0,
      quality: n.refreshing || 0
    })).sort((a, b) => a.date.localeCompare(b.date));
    setNapData(napChartData);

    // Load medication data
    const allMedIntakes = await db.getAll('medIntakes');
    const medIntakesInRange = allMedIntakes.filter((m) => {
      const date = m.timestamp.split('T')[0];
      return date >= start && date <= end;
    });

    const medByDate = new Map<string, Map<string, number>>();
    medIntakesInRange.forEach((intake) => {
      const date = intake.timestamp.split('T')[0];
      if (!medByDate.has(date)) {
        medByDate.set(date, new Map());
      }
      const dateMap = medByDate.get(date)!;
      const medIdStr = intake.medication_id.toString();
      dateMap.set(medIdStr, (dateMap.get(medIdStr) || 0) + 1);
    });

    const medChartData = Array.from(medByDate.entries()).map(([date, medCounts]) => {
      const result: any = {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      
      selectedMeds.forEach(medId => {
        const med = meds.find(m => m.id === medId);
        if (med) {
          const medIdStr = med.id?.toString() || medId;
          result[med.name] = medCounts.get(medIdStr) || 0;
        }
      });
      
      return result;
    }).sort((a, b) => a.date.localeCompare(b.date));

    setMedData(medChartData);
  };

  const toggleDataPoint = (dp: string) => {
    setSelectedDataPoints(prev => 
      prev.includes(dp) ? prev.filter(p => p !== dp) : [...prev, dp]
    );
  };

  const toggleMed = (medId: string) => {
    setSelectedMeds(prev => 
      prev.includes(medId) ? prev.filter(m => m !== medId) : [...prev, medId]
    );
  };

  useEffect(() => {
    if (selectedDataPoints.length > 0 || selectedMeds.length > 0) {
      loadData();
    }
  }, [selectedDataPoints, selectedMeds]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Data Graphs</h1>
            <p className="text-muted-foreground">
              Visualize your tracking data over time
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(['1d', '2d', '3d', '7d', '30d', '6m', '1y', 'all'] as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  onClick={() => setTimeRange(range)}
                >
                  {range === 'all' ? 'All Time' : range.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SSS Check-Ins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customDataPoints.length > 0 && (
              <div className="space-y-2">
                <Label>Select Data Points to Display</Label>
                <div className="flex flex-wrap gap-4">
                  {customDataPoints.map((dp) => (
                    <div key={dp} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedDataPoints.includes(dp)}
                        onCheckedChange={() => toggleDataPoint(dp)}
                      />
                      <Label className="cursor-pointer" onClick={() => toggleDataPoint(dp)}>
                        {dp}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={checkInData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgSSS" stroke="hsl(var(--primary))" name="Avg SSS" />
                {selectedDataPoints.map((dp, idx) => (
                  <Line
                    key={dp}
                    type="monotone"
                    dataKey={dp}
                    stroke={COLORS[idx % COLORS.length]}
                    name={dp}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sleep Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="tst" stroke={COLORS[0]} name="Total Sleep (min)" />
                <Line yAxisId="right" type="monotone" dataKey="quality" stroke={COLORS[1]} name="Quality (1-5)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nap Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={napData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="duration" stroke={COLORS[2]} name="Duration (min)" />
                <Line yAxisId="right" type="monotone" dataKey="quality" stroke={COLORS[3]} name="Quality (1-5)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medication Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {medications.length > 0 && (
              <div className="space-y-2">
                <Label>Select Medications to Display</Label>
                <div className="flex flex-wrap gap-4">
                  {medications.map((med) => (
                    <div key={med.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedMeds.includes(med.id)}
                        onCheckedChange={() => toggleMed(med.id)}
                      />
                      <Label className="cursor-pointer" onClick={() => toggleMed(med.id)}>
                        {med.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={medData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedMeds.map((medId, idx) => {
                  const med = medications.find(m => m.id === medId);
                  return med ? (
                    <Line
                      key={medId}
                      type="monotone"
                      dataKey={med.name}
                      stroke={COLORS[idx % COLORS.length]}
                      name={med.name}
                    />
                  ) : null;
                })}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
