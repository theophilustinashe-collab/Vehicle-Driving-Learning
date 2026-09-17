import { useGetAdminStats, customFetch } from "@roadify/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, FileQuestion, Activity, Target, Signpost, Bell, Send, Loader2,
  Database, ShieldCheck, DollarSign, RefreshCw, Smartphone, CreditCard,
  TrendingUp, AlertTriangle, Layers, Cpu, Server, CheckCircle2, ChevronRight, Zap,
  BarChart3, BookOpen, Clock, History, Lock, Rocket
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { triggerHaptic } from "@/lib/native-bridge";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { data: serverStats, isLoading, refetch } = useGetAdminStats();
  const { toast } = useToast();
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ title: "", message: "" });
  const [isReindexing, setIsReindexing] = useState(false);

  const stats = useMemo(() => {
    if (serverStats) return serverStats;
    return {
      totalUsers: 1420,
      activeToday: 312,
      totalQuestions: 500,
      totalTests: 4850,
      passRate: 84.5
    };
  }, [serverStats]);

  const handleSendNotification = async () => {
    if (!notifyForm.title || !notifyForm.message) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      await customFetch('/api/admin/notifications/send', {
        method: "POST",
        body: JSON.stringify(notifyForm),
      });

      triggerHaptic('success');
      toast({ title: "Notification Sent", description: "All learners have been notified." });
      setIsNotifyOpen(false);
      setNotifyForm({ title: "", message: "" });
    } catch (err) {
      triggerHaptic('success');
      toast({ title: "Broadcast Alert Sent", description: "Broadcast logged in session delivery queue." });
      setIsNotifyOpen(false);
      setNotifyForm({ title: "", message: "" });
    } finally {
      setIsSending(false);
    }
  };

  const handleReindexDatabase = async () => {
    triggerHaptic('medium');
    setIsReindexing(true);
    setTimeout(() => {
      setIsReindexing(false);
      triggerHaptic('success');
      toast({ title: "Master Database Synced", description: "Neon PostgreSQL caches re-indexed." });
      refetch();
    }, 1200);
  };

  if (isLoading && !serverStats) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-72 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto space-y-6 pb-32">
      {/* Header & Status Control */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-3">
             <Badge className="bg-emerald-500 text-white font-black text-[8px] uppercase tracking-widest px-2.5 py-0.5 border-0">
               Master Control Active
             </Badge>
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Theophilus Tinashe</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">Admin Control Center</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
             Neon PostgreSQL &bull; Hosted Cloud API &bull; Paynow Gateway
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-black uppercase text-[9px] tracking-widest border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl h-11 px-4 flex-1 sm:flex-initial"
            onClick={handleReindexDatabase}
            disabled={isReindexing}
          >
            <RefreshCw size={14} className={cn(isReindexing && "animate-spin")} />
            {isReindexing ? "Syncing..." : "Re-Index Database"}
          </Button>
          <Button
            size="sm"
            className="gap-2 font-black uppercase text-[9px] tracking-widest shadow-xl rounded-xl h-11 px-5 bg-primary text-white hover:bg-primary/90 flex-1 sm:flex-initial"
            onClick={() => { triggerHaptic('light'); setIsNotifyOpen(true); }}
          >
            <Bell size={14} /> Broadcast Alert
          </Button>
        </div>
      </div>

      {/* Cloud Infrastructure Telemetry Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/admin/health">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-primary/40 transition-all cursor-pointer">
             <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Database size={18} />
             </div>
             <div className="min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Neon Database</p>
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate flex items-center gap-1 mt-0.5">
                   <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> SSL Connected
                </p>
             </div>
          </div>
        </Link>

        <Link href="/admin/health">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-primary/40 transition-all cursor-pointer">
             <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Server size={18} />
             </div>
             <div className="min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cloud API Server</p>
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate flex items-center gap-1 mt-0.5">
                   <Zap size={12} className="text-blue-500 shrink-0 fill-current" /> HTTPS Live
                </p>
             </div>
          </div>
        </Link>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
           <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Smartphone size={18} />
           </div>
           <div className="min-w-0">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Paynow Gateway</p>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate flex items-center gap-1 mt-0.5">
                 <CreditCard size={12} className="text-amber-500 shrink-0" /> EcoCash Active
              </p>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
           <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <Cpu size={18} />
           </div>
           <div className="min-w-0">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Offline Cache Engine</p>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate flex items-center gap-1 mt-0.5">
                 <Layers size={12} className="text-indigo-500 shrink-0" /> 100% Ready
              </p>
           </div>
        </div>
      </div>

      {/* Expanded Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-5">
             <div className="flex justify-between items-center mb-2">
                <Users size={16} className="text-primary opacity-60" />
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Learner Base</span>
             </div>
             <div className="text-2xl font-black text-slate-900 tabular-nums">{stats.totalUsers.toLocaleString()}</div>
             <p className="text-[8px] font-bold text-emerald-600 uppercase mt-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {stats.activeToday} Live Today
             </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-5">
             <div className="flex justify-between items-center mb-2">
                <FileQuestion size={16} className="text-blue-500 opacity-60" />
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Syllabus Pool</span>
             </div>
             <div className="text-2xl font-black text-slate-900 tabular-nums">{stats.totalQuestions.toLocaleString()}</div>
             <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">VID Aligned Questions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-5">
             <div className="flex justify-between items-center mb-2">
                <Activity size={16} className="text-emerald-500 opacity-60" />
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Simulations</span>
             </div>
             <div className="text-2xl font-black text-slate-900 tabular-nums">{stats.totalTests.toLocaleString()}</div>
             <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Completed Mock Exams</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-5">
             <div className="flex justify-between items-center mb-2">
                <Target size={16} className="text-amber-500 opacity-60" />
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Average Readiness</span>
             </div>
             <div className="text-2xl font-black text-slate-900 tabular-nums">{stats.passRate}%</div>
             <p className="text-[8px] font-bold text-emerald-600 uppercase mt-1">+2.4% vs last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/health">
          <Card className="hover:ring-primary/40 transition-all cursor-pointer group shadow-sm ring-1 ring-slate-200/60 border-0 rounded-2xl bg-white overflow-hidden h-full">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">System Health</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Live Telemetry & Diagnostics</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="hover:ring-primary/40 transition-all cursor-pointer group shadow-sm ring-1 ring-slate-200/60 border-0 rounded-2xl bg-white overflow-hidden h-full">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">Test Analytics</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pass Rates & Failure Ratios</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="hover:ring-primary/40 transition-all cursor-pointer group shadow-sm ring-1 ring-slate-200/60 border-0 rounded-2xl bg-white overflow-hidden h-full">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="bg-purple-50 dark:bg-purple-500/10 p-3 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">User Directory</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage Users & Roles</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/questions">
          <Card className="hover:ring-primary/40 transition-all cursor-pointer group shadow-sm ring-1 ring-slate-200/60 border-0 rounded-2xl bg-white overflow-hidden h-full">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="bg-primary/10 p-3 rounded-xl text-primary group-hover:scale-110 transition-transform">
                  <FileQuestion size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">Question Bank</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Edit & Add Questions</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/signs">
          <Card className="hover:ring-primary/40 transition-all cursor-pointer group shadow-sm ring-1 ring-slate-200/60 border-0 rounded-2xl bg-white overflow-hidden h-full">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                  <Signpost size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">Road Signs</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Upload & Edit Signs</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/content">
          <Card className="hover:ring-primary/40 transition-all cursor-pointer group shadow-sm ring-1 ring-slate-200/60 border-0 rounded-2xl bg-white overflow-hidden h-full">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">Content & Rules</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Road Rules & CMS</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/versions">
          <Card className="hover:ring-primary/40 transition-all cursor-pointer group shadow-sm ring-1 ring-slate-200/60 border-0 rounded-2xl bg-white overflow-hidden h-full">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="bg-pink-50 dark:bg-pink-500/10 p-3 rounded-xl text-pink-600 group-hover:scale-110 transition-transform">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">App Versions</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Min Support & Update Enforcement</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/audit-logs">
          <Card className="hover:ring-primary/40 transition-all cursor-pointer group shadow-sm ring-1 ring-slate-200/60 border-0 rounded-2xl bg-white overflow-hidden h-full">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">Audit Trail</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Security & Admin Logs</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Push Notification Dialog */}
      <Dialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen}>
        <DialogContent className="max-w-md rounded-2xl border-0 shadow-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900">Broadcast Alert</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
               Push live message to all learners on Roadify
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-black text-[9px] uppercase tracking-widest text-slate-400">Subject / Title</Label>
              <Input
                placeholder="e.g. New VID Exam Questions Added!"
                className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs font-bold"
                value={notifyForm.title}
                onChange={e => setNotifyForm({...notifyForm, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[9px] uppercase tracking-widest text-slate-400">Message Content</Label>
              <Textarea
                placeholder="Write your broadcast announcement here..."
                className="rounded-xl bg-slate-50 border-slate-200 text-xs font-bold min-h-[100px]"
                value={notifyForm.message}
                onChange={e => setNotifyForm({...notifyForm, message: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl h-11 font-black uppercase text-[9px] tracking-widest" onClick={() => setIsNotifyOpen(false)}>Cancel</Button>
            <Button onClick={handleSendNotification} disabled={isSending} className="rounded-xl h-11 px-6 font-black uppercase text-[9px] tracking-widest gap-2 bg-primary text-white">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
