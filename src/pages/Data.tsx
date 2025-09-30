import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { getDB, computeTotalSleepMinutes, computeNapDuration, formatMinutesAsTime } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';

export default function DataPage() {
  const [sleepEntries, setSleepEntries] = useState<any[]>([]);
  const [naps, setNaps] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [medIntakes, setMedIntakes] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);

  const loadData = async () => {
    const db = await getDB();
    const sleep = await db.getAll('sleepEntries');
    setSleepEntries(sleep.sort((a, b) => b.date.localeCompare(a.date)));

    const n = await db.getAll('naps');
    setNaps(n.sort((a, b) => b.date.localeCompare(a.date)));

    const c = await db.getAll('checkIns');
    setCheckIns(c.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));

    const m = await db.getAll('medIntakes');
    setMedIntakes(m.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));

    const meds = await db.getAll('medications');
    setMedications(meds);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMedicationName = (id: number) => {
    const med = medications.find((m) => m.id === id);
    return med ? med.name : `ID ${id}`;
  };

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
            <h1 className="text-3xl font-bold">Data & Records</h1>
            <p className="text-muted-foreground">
              View all logged data (read-only)
            </p>
          </div>
        </div>

        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="pt-6">
            <Tabs defaultValue="sleep">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="sleep">Sleep</TabsTrigger>
                <TabsTrigger value="naps">Naps</TabsTrigger>
                <TabsTrigger value="checkins">Check-Ins</TabsTrigger>
                <TabsTrigger value="meds">Med Intakes</TabsTrigger>
              </TabsList>

              <TabsContent value="sleep" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Bedtime</TableHead>
                        <TableHead>Sleep Onset</TableHead>
                        <TableHead>Wake Time</TableHead>
                        <TableHead>TST</TableHead>
                        <TableHead>Quality</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sleepEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No sleep entries yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        sleepEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.date}</TableCell>
                            <TableCell>{entry.bedtime || '—'}</TableCell>
                            <TableCell>{entry.sleep_onset || '—'}</TableCell>
                            <TableCell>{entry.wake_time || '—'}</TableCell>
                            <TableCell>{formatMinutesAsTime(computeTotalSleepMinutes(entry))}</TableCell>
                            <TableCell>{entry.sleep_quality}/5</TableCell>
                            <TableCell className="max-w-xs truncate">{entry.notes || '—'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="naps" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Planned</TableHead>
                        <TableHead>Refreshing</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {naps.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No naps logged yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        naps.map((nap) => (
                          <TableRow key={nap.id}>
                            <TableCell className="font-medium">{nap.date}</TableCell>
                            <TableCell>{nap.start}</TableCell>
                            <TableCell>{nap.end}</TableCell>
                            <TableCell>{formatMinutesAsTime(computeNapDuration(nap))}</TableCell>
                            <TableCell>{nap.planned ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{nap.refreshing}/5</TableCell>
                            <TableCell className="max-w-xs truncate">{nap.notes || '—'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="checkins" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Context</TableHead>
                        <TableHead>SSS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checkIns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No check-ins yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        checkIns.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">
                              {new Date(c.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>{c.context}</TableCell>
                            <TableCell className="font-bold">{c.sss}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="meds" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dose (mg)</TableHead>
                        <TableHead>Taken</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medIntakes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No intakes logged yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        medIntakes.map((intake) => (
                          <TableRow key={intake.id}>
                            <TableCell className="font-medium">
                              {new Date(intake.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>{getMedicationName(intake.medication_id)}</TableCell>
                            <TableCell>{intake.dose_mg || '—'}</TableCell>
                            <TableCell>{intake.taken ? 'Yes' : 'No'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
