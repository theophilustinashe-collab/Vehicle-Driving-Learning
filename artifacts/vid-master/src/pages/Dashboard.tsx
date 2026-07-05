import { useGetDashboard, useGetLeaderboard, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  PlayCircle, Award, Target, Zap, Clock, CheckCircle2,
  XCircle, AlertCircle, Trophy, Medal, History as HistoryIcon,
  Octagon, BookOpen, MapPin, HelpCircle, Lightbulb, Sparkles,
  ArrowRight, Flame, TrendingUp
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

export default function Dashboard() {
  const [_, setLocation] = useLocation();
  const { data: user } = useGetMe();
  const { data: dashboard, isLoading, error, refetch } = useGetDashboard();
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useGetLeaderboard({ period: "weekly" });

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name ? `, ${user.name.split(' ')[0]}` : "";
    if (hour < 12) return `Good morning${name}`;
    if (hour < 17) return `Good afternoon${name}`;
    return `Good evening${name}`;
  };

  const getEstimatedTestDate = (readiness: number) => {
    if (readiness >= 90) return "Ready Today!";
    let daysToAdd = 30;
    if (readiness >= 80) daysToAdd = 3;
    else if (readiness >= 70) daysToAdd = 7;
    else if (readiness >= 60) daysToAdd = 14;
    else if (readiness >= 40) daysToAdd = 21;
    const estimatedDate = addDays(new Date(), daysToAdd);
    return format(estimatedDate, "do MMM yyyy");
  };

  // RIVAL ALERT LOGIC - Safely handle loading states and empty arrays
  const rival = useMemo(() => {
    if (!Array.isArray(leaderboard) || !user) return null;
    const myRankIndex = leaderboard.findIndex(e => e.userId === user.id);
    if (myRankIndex > 0) {
      return leaderboard[myRankIndex - 1]; // The person directly above me
    }
    return null;
  }, [leaderboard, user]);

  const isStreakWarning = !dashboard?.dailyChallengeCompleted && new Date().getHours() >= 20;

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-2xl font-bold text-destructive">Failed to load dashboard</h2>
        <Button onClick={() => refetch()} variant="outline">Try Again</Button>
      </div>
    );
  }

  const top3 = Array.isArray(leaderboard) ? leaderboard.slice(0, 3) : [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">

      {/* HEADER WITH GREETING & RIVAL ALERT */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900">{getGreeting()}!</h1>
          <p className="text-sm md:text-base text-muted-foreground font-bold mt-2 flex items-center gap-2">
             <MapPin className="w-4 h-4 text-primary" /> Studying from {user?.city || "Zimbabwe"}
          </p>
        </div>

        {rival && (
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-white/10 group cursor-pointer hover:scale-[1.02] transition-all self-center lg:self-auto"
            onClick={() => setLocation("/leaderboard")}
          >
            <div className="relative shrink-0">
              <Avatar className="w-12 h-12 border-2 border-primary">
                {rival.avatarUrl && <AvatarImage src={rival.avatarUrl} className="object-cover" />}
                <AvatarFallback className="text-[10px] bg-slate-800 text-primary font-black">
                {rival.name ? rival.name.substring(0, 2).toUpperCase() : "??"}
              </AvatarFallback>
              </Avatar>
              <div className="absolute -top-2 -right-1 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg">RIVAL</div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-primary leading-none mb-1">Next Target</p>
              <p className="text-sm font-black leading-none">Overtake <span className="text-primary">{rival.name?.split(' ')[0] || "User"}</span></p>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1.5 leading-none">{(rival.xp - (user?.xp || 0)).toLocaleString()} XP Remaining</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm ring-1 ring-border rounded-3xl group overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Exam Readiness</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 tracking-tighter">{dashboard.examReadiness || 0}%</div>
            <Progress value={dashboard.examReadiness || 0} className="mt-3 h-2" />
            <p className="text-[10px] font-bold text-muted-foreground mt-4 uppercase flex items-center gap-1.5">
               <Clock className="w-3 h-3" /> Book Test: <span className="text-primary">{getEstimatedTestDate(dashboard.examReadiness || 0)}</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className={cn(
          "border-0 shadow-sm ring-1 ring-border rounded-3xl overflow-hidden transition-all duration-500",
          isStreakWarning ? "bg-red-50 ring-destructive/30" : "bg-white"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Streak</CardTitle>
            <Flame className={cn("w-5 h-5", isStreakWarning ? "text-destructive animate-bounce" : "text-orange-500")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-4xl font-black tracking-tighter", isStreakWarning ? "text-destructive" : "text-slate-900")}>{dashboard.streak || 0} Days</div>
            {isStreakWarning ? (
              <div className="mt-3 p-2 bg-destructive/10 rounded-xl flex items-center gap-2 text-destructive">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase">Streak Freezing! Solve Daily Challenge Now</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={cn("h-1.5 w-full rounded-full", i < (dashboard.streak || 0) ? "bg-orange-500" : "bg-slate-100")} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Mastery</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 tracking-tighter">{dashboard.masteredQuestions || 0}</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-4 uppercase">Questions Learned Perfectly</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border bg-slate-900 text-white rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Driver Level</CardTitle>
            <Award className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white tracking-tighter leading-none mb-3">Lv. {dashboard.level || 1}</div>
            <div className="flex items-center">
               <span className="text-[9px] font-black px-2 py-1 bg-primary rounded-md text-white uppercase tracking-wider">{dashboard.rank || "Beginner"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Challenge Section */}
        {dashboard && !dashboard.dailyChallengeCompleted && (
          <Card className="border-0 shadow-xl ring-1 ring-border rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden group">
            <CardContent className="p-8 space-y-6 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles className="w-32 h-32" />
              </div>
              <div className="space-y-2 relative z-10">
                <h2 className="text-2xl font-black tracking-tight uppercase">Daily Challenge</h2>
                <p className="text-white/80 font-bold">Earn +50 XP bonus and protect your streak today!</p>
              </div>
              <Link href="/questions?daily=true">
                <Button className="h-14 px-8 rounded-2xl bg-white text-primary hover:bg-slate-50 font-black text-lg gap-2 shadow-2xl relative z-10">
                  Solve Now <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Preview */}
        <Card className={cn(
          "border-0 shadow-xl ring-1 ring-border rounded-[2.5rem] overflow-hidden",
          dashboard?.dailyChallengeCompleted ? "lg:col-span-2" : ""
        )}>
          <CardHeader className="bg-slate-50 border-b py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black uppercase tracking-tight">Wall of Fame</CardTitle>
              </div>
              <Button
                variant="secondary" size="sm"
                className="text-[10px] font-black uppercase tracking-widest px-4 h-8 rounded-full border border-slate-200"
                onClick={() => setLocation("/leaderboard")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3.map((entry, idx) => (
                <div key={entry.userId} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-xl">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</div>
                  <Avatar className="w-10 h-10 shadow-sm border-2 border-white">
                    {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} />}
                    <AvatarFallback className="font-black text-xs bg-primary/10 text-primary">
                      {entry.name ? entry.name.substring(0, 2).toUpperCase() : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="truncate">
                    <p className="font-black text-xs truncate">{entry.name}</p>
                    <p className="text-[10px] font-bold text-primary">{entry.xp.toLocaleString()} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/test" className="md:col-span-2">
           <Button size="lg" className="w-full h-24 rounded-[2rem] bg-slate-900 text-white hover:bg-slate-800 text-xl font-black gap-4 shadow-2xl group overflow-hidden">
             <div className="bg-primary p-3 rounded-2xl group-hover:scale-110 transition-transform">
               <PlayCircle className="w-8 h-8" />
             </div>
             Initialize Full Mock Exam Simulator
           </Button>
        </Link>
        <Link href="/signs">
           <Button variant="outline" size="lg" className="w-full h-24 rounded-[2rem] border-2 border-slate-200 hover:border-primary/50 text-xl font-black gap-4 hover:bg-primary/5">
             <div className="bg-slate-100 p-3 rounded-2xl">
               <Octagon className="w-8 h-8 text-slate-400" />
             </div>
             Signs Library
           </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-border rounded-[2.5rem] overflow-hidden">
          <CardHeader className="border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-black uppercase tracking-tight">Recent Logbook</CardTitle>
                <CardDescription className="font-bold">Your latest certification attempts</CardDescription>
              </div>
              <HistoryIcon className="w-6 h-6 text-slate-200" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {!dashboard.recentTests || dashboard.recentTests.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-muted rounded-[2rem] bg-slate-50">
                <p className="text-muted-foreground font-black uppercase text-xs">No entries in logbook yet.</p>
                <Link href="/test">
                  <Button variant="outline" className="mt-4 rounded-xl font-bold">Launch First Simulator</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.recentTests.map((test) => (
                  <div key={test.sessionId} className="flex items-center justify-between p-4 rounded-2xl border bg-white hover:border-primary/30 transition-all cursor-default shadow-sm group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm",
                        test.passed ? 'bg-emerald-500 text-white' : 'bg-red-100 text-destructive'
                      )}>
                        {test.percentage}%
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 leading-tight">{test.passed ? 'CERTIFIED PASS' : 'BELOW THRESHOLD'}</p>
                        <div className="flex items-center text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest gap-2">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(test.completedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="text-slate-900">{test.score}/{test.total} Correct</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/test/${test.sessionId}/results`}>
                      <Button variant="ghost" size="sm" className="font-black uppercase text-[10px] group-hover:bg-primary group-hover:text-white rounded-lg">Details</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm ring-1 ring-border rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-slate-50">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Rapid Focus</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Link href="/mistakes">
                <div className="p-5 rounded-2xl bg-red-50 border border-red-100 hover:bg-red-100 transition-all cursor-pointer group flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-destructive uppercase text-xs tracking-widest">Mistake Bank</h3>
                    <p className="text-[10px] font-bold text-red-700/60 mt-1 uppercase">Targeted Re-testing</p>
                  </div>
                  <AlertCircle className="w-6 h-6 text-destructive opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
              <Link href="/bookmarks">
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all cursor-pointer group flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-primary uppercase text-xs tracking-widest">Saved Items</h3>
                    <p className="text-[10px] font-bold text-primary/60 mt-1 uppercase">Saved for later</p>
                  </div>
                  <BookOpen className="w-6 h-6 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[2.5rem] bg-indigo-900 text-white text-center space-y-4 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                <HelpCircle className="w-6 h-6 text-primary" />
             </div>
             <p className="font-black uppercase tracking-widest text-[10px] text-primary">Support Active</p>
             <h3 className="text-lg font-black leading-tight">Got a question?</h3>
             <Link href="/support">
                <Button className="w-full bg-white text-indigo-900 hover:bg-slate-100 font-black rounded-xl h-12 shadow-xl shadow-indigo-950/50">Chat with Experts</Button>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
