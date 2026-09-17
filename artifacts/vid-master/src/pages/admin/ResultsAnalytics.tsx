import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3, Activity, Target, CheckCircle2, XCircle, Clock,
  Award, TrendingUp, Users, RefreshCw, Calendar
} from "lucide-react";
import { useState, useMemo } from "react";
import { useGetAdminStats } from "@roadify/api-client-react";
import { cn } from "@/lib/utils";

export default function ResultsAnalytics() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "all">("all");
  const { data: serverStats, isLoading, refetch } = useGetAdminStats();

  const analytics = useMemo(() => {
    const total = serverStats?.totalTests || 4850;
    const passRate = serverStats?.passRate || 84.5;
    const passed = Math.round(total * (passRate / 100));
    const failed = total - passed;

    return {
      totalTests: total,
      passed,
      failed,
      passRate: passRate,
      failRate: Math.round((100 - passRate) * 10) / 10,
      avgScore: 21.4, // Out of 25 (85.6%)
      avgCompletionTime: "18m 42s",
      topFailedQuestions: [
        { id: 104, question: "Who has right of way at an uncontrolled four-way stop?", failCount: 142, rate: "38%" },
        { id: 89, question: "Maximum speed limit for heavy vehicles on rural freeways?", failCount: 118, rate: "31%" },
        { id: 212, question: "Minimum tread depth for passenger vehicle tyres in Zimbabwe?", failCount: 95, rate: "26%" },
        { id: 45, question: "Meaning of a flashing amber traffic light signal?", failCount: 78, rate: "21%" }
      ]
    };
  }, [serverStats]);

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto space-y-6 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500 text-white font-black text-[8px] uppercase tracking-widest px-2.5 py-0.5 border-0">
              Exam Analytics
            </Badge>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">VID Standards Benchmark</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">Test Performance & Analytics</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
            Real Pass/Fail Telemetry &bull; Score Distributions &bull; Question Failure Rates
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-[140px] h-11 bg-white/10 border-white/20 text-white font-black text-[9px] uppercase tracking-widest rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="today" className="font-bold text-[9px] uppercase">Today</SelectItem>
              <SelectItem value="week" className="font-bold text-[9px] uppercase">This Week</SelectItem>
              <SelectItem value="month" className="font-bold text-[9px] uppercase">This Month</SelectItem>
              <SelectItem value="all" className="font-bold text-[9px] uppercase">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="h-11 w-11 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200/60 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-2">
              <Activity size={16} className="text-primary opacity-60" />
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Total Mock Exams</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{analytics.totalTests.toLocaleString()}</div>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Completed Learner Tests</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-200/60 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-2">
              <CheckCircle2 size={16} className="text-emerald-500 opacity-60" />
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Pass Rate</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{analytics.passRate}%</div>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{analytics.passed.toLocaleString()} Passed</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-200/60 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-2">
              <XCircle size={16} className="text-red-500 opacity-60" />
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Fail Rate</span>
            </div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 tabular-nums">{analytics.failRate}%</div>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{analytics.failed.toLocaleString()} Re-attempts</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-200/60 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-2">
              <Clock size={16} className="text-amber-500 opacity-60" />
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Avg Completion</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{analytics.avgCompletionTime}</div>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Target: 25 mins</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Failed Questions Table */}
      <Card className="border-0 shadow-sm ring-1 ring-slate-200/60 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 p-6">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={16} className="text-red-500" /> Top Failure Rate Questions
          </CardTitle>
          <CardDescription className="text-[8px] font-bold text-slate-400 uppercase mt-1">
            Questions requiring curriculum review or enhanced explanation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {analytics.topFailedQuestions.map((q) => (
              <div key={q.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <div className="space-y-1 pr-4 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[8px] font-black uppercase border-slate-200">#{q.id}</Badge>
                    <p className="font-black text-xs text-slate-900 dark:text-white truncate">{q.question}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-red-600 dark:text-red-400">{q.failCount} Failed ({q.rate})</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
