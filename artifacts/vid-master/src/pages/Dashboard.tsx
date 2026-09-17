import { useGetDashboard, useGetLeaderboard, useGetMe } from "@roadify/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Trophy, Target, Flame, ChevronRight, BarChart3, CheckCircle,
  Sparkles, Brain, Coins, Car, Crown, Gauge, Zap, Flag,
  Signpost, BookOpen, Calendar, ClipboardCheck, ShieldCheck, Pencil
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { transitions, variants } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

/**
 * Interface representing the projected exam readiness state.
 */
interface ProjectedMastery {
  /** Estimated number of days remaining until 100% exam readiness */
  days: number;
  /** Formatted date string or status text for target completion */
  date: string;
  /** Descriptive status label (e.g. "Mastered", "On Track", "Steady Progress") */
  status: string;
}

/**
 * Interface representing a recent test attempt.
 */
interface RecentTest {
  sessionId: string | number;
  passed: boolean;
  percentage: number;
  completedAt: string;
  score: number;
  total: number;
}

/**
 * Interface representing a player entry in the leaderboard.
 */
interface LeaderboardPlayer {
  name?: string;
  avatarUrl?: string;
  level?: number;
  xp?: number;
}

/**
 * Interface representing the active dashboard statistics and activity data.
 */
interface DashboardData {
  examReadiness: number;
  streak: number;
  level: number;
  rank: string;
  recentTests: RecentTest[];
  masteredQuestions: number;
}

/**
 * @file Dashboard.tsx
 * @description Main dashboard view for the Roadify Learner Exam Simulator.
 *
 * Provides an overview of learner progress including:
 * - User profile, current level, rank, and XP progress bar.
 * - Core statistics: Exam readiness percentage, streak count, mastered questions, and coin balance.
 * - Exam Mastery Roadmap card projecting target exam readiness date.
 * - Recent test attempts log with scores and pass/fail indicators.
 * - Quick action sidebars: Garage access, Hall of Fame leaderboard top rankers, and curriculum links (Signs & Question Bank).
 */

/**
 * Main Dashboard component displaying learner stats, study activity, leaderboard preview, and quick navigation.
 *
 * @returns {JSX.Element} The rendered dashboard view wrapped in Framer Motion animations.
 */
export default function Dashboard() {
  /** Current user account data from API */
  const { data: user, isLoading: isUserLoading } = useGetMe();

  /** Server-side dashboard statistics from API */
  const { data: serverDashboard, isLoading: isDashboardLoading } = useGetDashboard();

  /** Top rankers for the provincial leaderboard */
  const { data: leaderboard } = useGetLeaderboard();

  /**
   * Computes the active dashboard data.
   * Priority order:
   * 1. Live server dashboard data if available.
   * 2. Cached dashboard state from `localStorage` (`vid_cached_dashboard`).
   * 3. Initial dynamic fallback calculated from the logged-in user profile's XP, streak, and level.
   */
  const dashboard = useMemo<DashboardData>(() => {
    if (serverDashboard) return serverDashboard;
    const cached = typeof window !== 'undefined' ? localStorage.getItem('vid_cached_dashboard') : null;
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall back to dynamic initial state on parse error
      }
    }
    // Dynamic initial state derived from stored user data
    return {
      examReadiness: user?.xp ? Math.min(100, Math.round((user.xp / 1000) * 20)) : 0,
      streak: user?.streak || 0,
      level: user?.level || 1,
      rank: user?.level && user.level > 5 ? "Advanced Learner" : "Learner",
      recentTests: [],
      masteredQuestions: 0
    };
  }, [serverDashboard, user]);

  /**
   * Generates a time-of-day appropriate greeting string for the user header.
   */
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  /**
   * Calculates projected exam mastery date based on current exam readiness.
   * Assumes an average progress rate of ~2% per day of regular study.
   */
  const projectedMastery: ProjectedMastery = useMemo(() => {
    const readiness = dashboard.examReadiness || 0;
    if (readiness >= 100) {
      return { days: 0, date: "Ready Now", status: "Mastered" };
    }
    const remainingPct = 100 - readiness;
    const daysNeeded = Math.max(1, Math.ceil(remainingPct / 2));
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysNeeded);
    const dateStr = targetDate
      .toLocaleDateString("en-US", { month: "short", day: "numeric" })
      .replace(",", "");
    return {
      days: daysNeeded,
      date: dateStr,
      status: readiness > 75 ? "On Track" : readiness > 40 ? "Steady Progress" : "Getting Started"
    };
  }, [dashboard.examReadiness]);

  /** Flag determining if loading skeleton should be shown during initial app load */
  const isLoading = (isUserLoading || isDashboardLoading) && !user && !serverDashboard;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <Skeleton className="w-20 h-20 rounded-2xl animate-pulse" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-8 w-48 rounded-lg" />
            </div>
          </div>
          <Skeleton className="w-full md:w-80 h-24 rounded-2xl" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm overflow-hidden bg-white/50">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-full rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-64 rounded-[2.5rem]" />
          <Skeleton className="lg:col-span-4 h-64 rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  /** Current XP progress towards the next 1,000 XP level threshold */
  const xpProgress = (user?.xp || 0) % 1000;
  /** Percentage completion of current XP level */
  const xpPercent = (xpProgress / 1000) * 100;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants.staggerContainer}
      className="max-w-7xl mx-auto space-y-6 p-3 md:p-6 pb-32 relative"
    >
      {/* =========================================================================
          AMBIENT DASHBOARD BACKGROUND GLOWS
         ========================================================================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.07, 0.03],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary/20 blur-[140px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.02, 0.05, 0.02],
            x: [0, -100, 0],
            y: [0, 50, 0]
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full"
        />
      </div>

      {/* =========================================================================
          HEADER & XP / LEVEL PROGRESS BAR
         ========================================================================= */}
      <motion.div
        variants={variants.fadeInUp}
        className="glass-card p-4 md:p-5 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-transparent pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />

        {/* User Profile Info */}
        <div className="min-w-0 relative z-10 flex flex-row items-center gap-4 text-left">
          <Link href="/settings" className="relative shrink-0 cursor-pointer group/avatar">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-900 border-4 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl relative overflow-hidden">
              {user?.avatarUrl && user.avatarUrl.trim() !== "" ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name?.trim() || "User Avatar"}
                  className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover/avatar:scale-110"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-indigo-600 opacity-90" />
                  <span className="relative z-10 drop-shadow-md">
                    {user?.name?.trim() ? user.name.trim().charAt(0).toUpperCase() : "?"}
                  </span>
                </>
              )}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute top-0 bottom-0 w-12 bg-white/20 -skew-x-12 z-20"
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity z-30 flex items-center justify-center">
                <Pencil size={16} className="text-white" />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg z-40">
              <ShieldCheck size={12} className="text-white" />
            </div>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-slate-400 font-black text-[8px] uppercase tracking-[0.2em] mb-1 opacity-80">{greeting}</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none truncate">
                {user?.name?.trim() ? user.name.trim().split(" ")[0] : "Learner"}
              </h1>
              <Badge className="bg-primary text-white border-0 font-black text-[7px] uppercase tracking-widest px-2 py-0.5 shadow-sm shrink-0">
                {dashboard.rank || "Elite Learner"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-slate-400 font-bold text-[8px] uppercase tracking-widest opacity-70">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]" />
              Study Session Active
            </div>
          </div>
        </div>

        {/* Slim Level & XP Progress Indicator */}
        <div className="w-full md:w-72 space-y-2 relative z-10 bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
          <div className="flex justify-between items-end px-0.5">
            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight leading-none flex items-center gap-1.5">
              <Gauge size={10} className="text-primary" /> LVL {dashboard.level}
            </span>
            <span className="text-[9px] font-black text-primary leading-none tabular-nums">{xpProgress}/1K XP</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden shadow-sm relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ ...transitions.smooth, delay: 0.5 }}
              className="h-full bg-primary relative"
            >
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          CORE STATISTICS GRID
         ========================================================================= */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={variants.staggerContainer}
      >
        {[
          { icon: Target, label: "Readiness", val: `${dashboard.examReadiness}%`, color: "text-primary", bg: "bg-primary/10", glow: "hover:ring-primary/40", shadow: "shadow-primary/5" },
          { icon: Flame, label: "Streak", val: `${dashboard.streak} d`, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10", glow: "hover:ring-orange-400/40", shadow: "shadow-orange-500/5" },
          { icon: Brain, label: "Knowledge", val: dashboard.masteredQuestions || 0, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10", glow: "hover:ring-indigo-400/40", shadow: "shadow-indigo-500/5" },
          { icon: Coins, label: "Wallet", val: user?.coins != null ? user.coins.toLocaleString() : "0", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", glow: "hover:ring-emerald-400/40", shadow: "shadow-emerald-500/5" }
        ].map((stat) => (
          <motion.div key={stat.label} variants={variants.fadeInUp} whileHover="hover" initial="rest">
            <Card className={cn("border-0 neo-box rounded-2xl overflow-hidden transition-all duration-300", stat.glow, stat.shadow)}>
              <CardContent className="p-4 md:p-5">
                <div className="flex justify-between items-center mb-3">
                  <motion.div
                    variants={{ rest: { scale: 1 }, hover: { scale: 1.1, rotate: 12 } }}
                    className={cn("w-8 h-8 rounded-lg flex items-center justify-center shadow-inner", stat.bg, stat.color)}
                  >
                    <stat.icon size={16} />
                  </motion.div>
                  <span className="text-[7px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{stat.label}</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none tabular-nums">{stat.val}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* =========================================================================
            MAIN COLUMN: MASTERY ROADMAP & RECENT ACTIVITY
           ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Readiness Target & Exam Mastery Roadmap Card */}
          <motion.div variants={variants.fadeInUp}>
            <Link href="/exam-guide">
              <Card className="border-0 shadow-2xl liquid-glass text-white rounded-[2.5rem] overflow-hidden relative group cursor-pointer active:scale-[0.98] transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-primary opacity-90" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                  <Calendar size={180} />
                </div>

                <CardContent className="p-6 md:p-8 flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-xl flex flex-col items-center justify-center border border-white/20 shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">
                      {projectedMastery.days === 0 ? "STATUS" : "TARGET"}
                    </span>
                    <span className="text-2xl md:text-3xl font-black leading-none my-1 tabular-nums">
                      {projectedMastery.days === 0 ? "100" : projectedMastery.date.split(" ")[1] || projectedMastery.date}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                      {projectedMastery.days === 0 ? "MASTERED" : projectedMastery.date.split(" ")[0] || "DAYS"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">
                        Mastery Roadmap
                      </h3>
                      <Badge className="bg-emerald-500 text-white border-0 font-black text-[8px] px-2 py-0.5 animate-pulse shadow-lg shadow-emerald-500/20">
                        {projectedMastery.status}
                      </Badge>
                    </div>
                    <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={12} className="text-emerald-300" />
                      Projected: {projectedMastery.date}
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${dashboard.examReadiness}%` }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-emerald-400 to-primary shadow-[0_0_20px_rgba(52,211,153,0.6)]"
                          />
                        </div>
                        <span className="text-xs font-black text-white leading-none tabular-nums">{dashboard.examReadiness}%</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                          <Flag size={12} className="text-primary" /> Exam Target: {projectedMastery.date}
                        </p>
                        <div className="flex items-center gap-2 text-[8px] font-black text-emerald-300 uppercase tracking-widest">
                          <ClipboardCheck size={12} /> Ready for Success
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex w-10 h-10 rounded-full bg-white/10 items-center justify-center group-hover:bg-white/20 group-hover:translate-x-1 transition-all">
                    <ChevronRight size={24} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Recent Test Attempts Log */}
          <motion.div variants={variants.fadeInUp}>
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-black uppercase tracking-widest text-slate-900 dark:text-white">Recent Activity</CardTitle>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-wider">How you've been doing lately</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400">
                  <BarChart3 size={18} />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!dashboard.recentTests || dashboard.recentTests.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50/30 dark:bg-black/10">
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No recent tests captured.</p>
                    <Link href="/test">
                      <Button className="mt-6 h-11 px-8 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black uppercase text-[10px] tracking-widest gap-2.5 shadow-xl">
                        <Zap size={16} className="text-primary fill-current" /> Start a mock exam
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    <AnimatePresence mode="popLayout">
                      {dashboard.recentTests.slice(0, 5).map((test: RecentTest, index: number) => {
                        const formattedPercentage = Math.round(test.percentage ?? 0);
                        const formattedDate = test.completedAt && !isNaN(new Date(test.completedAt).getTime())
                          ? new Date(test.completedAt).toLocaleDateString()
                          : "Recent";

                        return (
                          <motion.div
                            key={test.sessionId ?? `test-${index}`}
                            variants={variants.fadeInUp}
                            layout
                            whileHover={{ x: 8, backgroundColor: "hsl(var(--primary) / 0.05)" }}
                            className="flex items-center justify-between p-5 transition-all group cursor-pointer relative overflow-hidden"
                          >
                            <Link
                              href={`/test/${test.sessionId}/results`}
                              className="absolute inset-0 z-20"
                              aria-label={`View test results from ${formattedDate}`}
                            />
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5"
                              style={{ backgroundColor: test.passed ? "#10b981" : "#ef4444" }}
                            />

                            <div className="flex items-center gap-5 relative z-10">
                              <div
                                className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shadow-sm border-2 transition-all duration-500 group-hover:scale-110",
                                  test.passed
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/10"
                                    : "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:border-red-500/20 shadow-red-500/10"
                                )}
                              >
                                {formattedPercentage}%
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-slate-900 dark:text-white text-base leading-none mb-1.5 uppercase tracking-tight">
                                  {test.passed ? "PASSED" : "RE-ATTEMPT"}
                                </p>
                                <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest gap-4">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar size={12} className="text-slate-300" /> {formattedDate}
                                  </span>
                                  <span className="opacity-20">•</span>
                                  <span className="flex items-center gap-1.5">
                                    <CheckCircle size={12} className="text-slate-300" /> {test.score}/{test.total} Score
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm relative z-10">
                              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* =========================================================================
            SIDEBAR COLUMN: GARAGE, HALL OF FAME, & CURRICULUM LINKS
           ========================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Garage Feature Card */}
          <motion.div variants={variants.fadeInUp}>
            <Card className="border-0 shadow-2xl liquid-glass text-white rounded-[2rem] overflow-hidden relative group cursor-pointer active:scale-95 transition-all">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[60px] group-hover:bg-primary/30 transition-colors" />

              <CardContent className="p-6 space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30 shadow-inner">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <Badge className="bg-white/10 text-white border-white/10 font-black text-[7px] uppercase tracking-widest px-2 py-1 backdrop-blur-md">
                    Premium Assets
                  </Badge>
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tighter uppercase leading-none">The Garage</h3>
                  <p className="text-slate-400 font-bold text-[10px] leading-tight uppercase tracking-wider mt-2 opacity-70">
                    Unlock legendary SADC vehicles and profile prestige.
                  </p>
                </div>

                <div className="relative h-16 flex items-center justify-center">
                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  >
                    <Car size={56} className="text-primary opacity-80 drop-shadow-[0_0_20px_hsl(var(--primary)/0.4)]" />
                  </motion.div>
                </div>

                <Link href="/garage">
                  <Button className="w-full h-12 rounded-xl bg-primary text-white hover:bg-primary/90 font-black text-[10px] uppercase tracking-[0.2em] gap-3 shadow-2xl shadow-primary/40 transition-all">
                    <Gauge className="w-4 h-4" /> Access Shop
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Provincial Leaderboard - Top 3 Rankers */}
          <motion.div variants={variants.fadeInUp}>
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 p-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Hall of Fame</CardTitle>
                  <p className="text-[7px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">Provincial Top Rankers</p>
                </div>
                <Trophy className="w-4 h-4 text-amber-500/40" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-3">
                  {leaderboard?.slice(0, 3).map((player: LeaderboardPlayer, idx: number) => (
                    <motion.div
                      key={player.name ? `${player.name}-${idx}` : idx}
                      whileHover={{ x: 4 }}
                      className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between gap-3 group transition-all relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-3 min-w-0 relative z-10">
                        <div className="relative">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm overflow-hidden transition-all shadow-md",
                              idx === 0
                                ? "bg-amber-400 text-white"
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            )}
                          >
                            {player.avatarUrl ? (
                              <img src={player.avatarUrl} alt={player.name || "Player Avatar"} className="w-full h-full object-cover" />
                            ) : player.name ? (
                              player.name.charAt(0)
                            ) : (
                              "?"
                            )}
                          </div>
                          {idx === 0 && <Crown className="absolute -top-1.5 -right-1.5 w-4 h-4 text-amber-500 drop-shadow-md" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 dark:text-white uppercase text-[10px] truncate">
                            {player.name || "Anonymous Learner"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge className="bg-primary/10 text-primary text-[6px] font-black h-3.5 px-1 border-0">
                              LV {player.level ?? 1}
                            </Badge>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter tabular-nums">
                              {(player.xp ?? 0).toLocaleString()} XP
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right relative z-10">
                        <span className="text-xs font-black text-slate-300 tabular-nums">#{idx + 1}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Link href="/leaderboard" className="block mt-4">
                  <Button
                    variant="ghost"
                    className="w-full h-10 border-2 border-dashed rounded-xl font-black uppercase text-[8px] tracking-widest text-slate-400 hover:text-primary hover:border-primary transition-all group"
                  >
                    Full Rankings <ChevronRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Access Curriculum Cards (Road Signs & Question Bank) */}
          <motion.div variants={variants.fadeInUp} className="grid grid-cols-2 gap-4">
            <Link href="/signs">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-primary/40 transition-all duration-300 group cursor-pointer flex flex-col items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-orange-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-inner relative z-10">
                  <Signpost size={24} />
                </div>
                <p className="font-black text-[11px] uppercase tracking-[0.15em] text-slate-900 dark:text-white relative z-10">Signs</p>
                <div className="mt-1 h-0.5 w-4 bg-orange-500/20 group-hover:w-8 transition-all relative z-10" />
              </div>
            </Link>
            <Link href="/questions">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-primary/40 transition-all duration-300 group cursor-pointer flex flex-col items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shadow-inner relative z-10">
                  <BookOpen size={24} />
                </div>
                <p className="font-black text-[11px] uppercase tracking-[0.15em] text-slate-900 dark:text-white relative z-10">Bank</p>
                <div className="mt-1 h-0.5 w-4 bg-blue-500/20 group-hover:w-8 transition-all relative z-10" />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
