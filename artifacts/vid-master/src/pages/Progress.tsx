import { useGetUserStats, useGetCategoryBreakdown, customFetch } from "@roadify/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import { Target, Activity, ArrowLeft, Trophy, Medal, Star, ShieldCheck, Zap, Signpost, TrendingUp, AlertTriangle, Calendar, Flag, ChevronRight, BookOpen, Brain, Sparkles, Award, Flame, Clock, GraduationCap, Wind, Shield, Settings2, Share2, Moon, MapPin, Compass, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { variants, transitions } from "@/lib/motion";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { addDays, format } from "date-fns";

export default function Progress() {
  const { data: serverStats, isLoading: statsLoading } = useGetUserStats();
  const { data: serverCategories, isLoading: catLoading } = useGetCategoryBreakdown();
  const [weakSpots, setWeakSpots] = useState<any[]>([]);
  const [weakSpotsLoading, setWeakSpotsLoading] = useState(true);

  // Premium Theme Colors
  const COLORS = {
    primary: "#166534", // Deep Green (Zim Heritage)
    secondary: "#f59e0b", // Gold
    accent: "#3b82f6", // Blue
    background: "#020617",
    card: "#ffffff"
  };

  useEffect(() => {
    customFetch('/api/progress/weak-spots')
      .then((res: any) => {
         if (res && Array.isArray(res)) setWeakSpots(res);
         else setWeakSpots([]);
      })
      .catch(() => {
        setWeakSpots([]);
      })
      .finally(() => setWeakSpotsLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (serverStats) return serverStats;
    const cached = typeof window !== 'undefined' ? localStorage.getItem('vid_cached_stats') : null;
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return {
      xp: 0,
      level: 1,
      streak: 0,
      totalTests: 0,
      totalQuestions: 0,
      accuracy: 0,
      examReadiness: 0,
      weeklyActivity: [0, 0, 0, 0, 0, 0, 0]
    };
  }, [serverStats]);

  const categories = useMemo(() => {
    if (serverCategories && serverCategories.length > 0) return serverCategories;
    const cached = typeof window !== 'undefined' ? localStorage.getItem('vid_cached_categories') : null;
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [];
  }, [serverCategories]);

  const realReadiness = useMemo(() => {
    if (!categories || categories.length === 0) return stats.examReadiness || 0;
    const avgAccuracy = categories.reduce((acc: number, cat: any) => acc + cat.accuracy, 0) / categories.length;
    const testVolumeBonus = Math.min(10, (stats.totalTests || 0) / 2);
    const streakBonus = Math.min(5, (stats.streak || 0));
    return Math.min(100, Math.round((avgAccuracy * 0.85) + testVolumeBonus + streakBonus));
  }, [categories, stats]);

  const activityData = useMemo(() => stats?.weeklyActivity?.map((val: any, idx: number) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx],
    tests: val
  })) || [], [stats]);

  const radarData = useMemo(() => categories?.map((c: any) => ({
    subject: c.category,
    accuracy: c.accuracy,
    fullMark: 100,
  })) || [], [categories]);

  const mockBadges = [
    { name: "Safety First", desc: "Complete 10 timed tests.", icon: ShieldCheck, earned: (stats?.totalTests || 0) >= 10, color: "bg-blue-500", progress: Math.min(100, ((stats?.totalTests || 0) / 10) * 100) },
    { name: "Sign Master", desc: "100% accuracy in Signs.", icon: Signpost, earned: (categories?.find((c: any) => c.category.toLowerCase().includes("sign"))?.accuracy === 100), color: "bg-emerald-500", progress: categories?.find((c: any) => c.category.toLowerCase().includes("sign"))?.accuracy || 0 },
    { name: "Speed Demon", desc: "Test under 5 minutes.", icon: Zap, earned: true, color: "bg-orange-500", progress: 100 },
    { name: "First 100%", desc: "Perfect 25/25 score.", icon: Trophy, earned: (stats?.accuracy || 0) >= 95, color: "bg-yellow-500", progress: stats?.accuracy || 0 },
    { name: "Steady Learner", desc: "Maintain a 5-day streak.", icon: Activity, earned: (stats?.streak || 0) >= 5, color: "bg-purple-500", progress: Math.min(100, ((stats?.streak || 0) / 5) * 100) },
    { name: "Top Scorer", desc: "Reach Driver Level 5.", icon: Medal, earned: (stats?.level || 0) >= 5, color: "bg-indigo-500", progress: Math.min(100, ((stats?.level || 0) / 5) * 100) },
    { name: "Rule Book", desc: "Answer 500 questions.", icon: BookOpen, earned: (stats?.totalQuestions || 0) >= 500, color: "bg-red-500", progress: Math.min(100, ((stats?.totalQuestions || 0) / 500) * 100) },
    { name: "Night Owl", desc: "Study after 10 PM.", icon: Clock, earned: true, color: "bg-slate-700", progress: 100 },
    { name: "City Driver", desc: "Tests for 3 cities.", icon: MapPin, earned: false, color: "bg-cyan-500", progress: 33 },
    { name: "Perfect Week", desc: "7-day learning streak.", icon: Calendar, earned: (stats?.streak || 0) >= 7, color: "bg-pink-500", progress: Math.min(100, ((stats?.streak || 0) / 7) * 100) },
    { name: "Emergency Ready", desc: "100% in Emergencies.", icon: AlertTriangle, earned: (categories?.find((c: any) => c.category.toLowerCase().includes("emergency"))?.accuracy === 100), color: "bg-amber-600", progress: categories?.find((c: any) => c.category.toLowerCase().includes("emergency"))?.accuracy || 0 },
    { name: "Pathfinder", desc: "Unlock all road signs.", icon: Compass, earned: false, color: "bg-emerald-600", progress: 65 },
    { name: "Veteran", desc: "1 month of active training.", icon: Shield, earned: false, color: "bg-slate-800", progress: 15 },
    { name: "Road Scholar", desc: "Read the entire Highway Code.", icon: GraduationCap, earned: true, color: "bg-indigo-600", progress: 100 },
    { name: "Early Bird", desc: "Study before 7 AM.", icon: Sparkles, earned: false, color: "bg-yellow-400", progress: 20 },
    { name: "High Speed", desc: "Average test under 3 mins.", icon: Wind, earned: false, color: "bg-blue-400", progress: 45 },
    { name: "Unstoppable", desc: "Maintain a 30-day streak.", icon: Target, earned: false, color: "bg-red-600", progress: 5 },
    { name: "Zim Pride", desc: "Achieve VID Master rank.", icon: Flag, earned: false, color: "bg-green-600", progress: 10 },
    { name: "Clean Record", desc: "No mistakes in a full test.", icon: ShieldCheck, earned: true, color: "bg-emerald-400", progress: 100 },
    { name: "Night Vision", desc: "Study after midnight.", icon: Moon, earned: false, color: "bg-indigo-900", progress: 40 },
    { name: "Mechanic", desc: "Visit the garage 5 times.", icon: Settings2, earned: false, color: "bg-slate-600", progress: 60 },
    { name: "Influencer", desc: "Share success 3 times.", icon: Share2, earned: false, color: "bg-blue-600", progress: 0 },
    { name: "Marathoner", desc: "1 hour continuous study.", icon: Clock, earned: false, color: "bg-orange-600", progress: 85 },
    { name: "Graduate", desc: "Reach Driver Level 15.", icon: GraduationCap, earned: false, color: "bg-purple-900", progress: (stats?.level / 15) * 100 },
  ];

  if (statsLoading && !serverStats && !localStorage.getItem('vid_cached_stats')) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={variants.listContainer} className="p-3 md:p-6 max-w-7xl mx-auto space-y-8 pb-32 overflow-hidden">
      <motion.div variants={variants.listItem} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
                <ArrowLeft size={16} />
              </Button>
           </Link>
           <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Performance</h1>
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-1">Intelligence Analytics</p>
           </div>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <Sparkles className="w-4 h-4 text-primary animate-pulse" /><span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Live Telemetry</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* READINESS ENGINE */}
        <motion.div variants={variants.listItem} className="lg:col-span-8">
          <Card className="border-0 shadow-2xl bg-[#020617] text-white rounded-2xl overflow-hidden relative h-full">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />
            <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
              <div className="space-y-6 flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                  <TrendingUp className="w-4 h-4 text-primary" /><span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">Mastery AI</span>
                </div>
                <div className="space-y-3">
                   <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">Ready to Test?</h2>
                   <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed">Full Competency Projection:</p>
                </div>
                <div className="flex items-center gap-5 justify-center md:justify-start">
                   <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-2xl"><Calendar className="w-7 h-7 text-primary" /></div>
                   <span className="text-3xl md:text-4xl font-black tracking-tight">{realReadiness >= 90 ? "Qualified" : format(addDays(new Date(), Math.max(1, Math.ceil((100-realReadiness)/5))), "MMM do, yyyy")}</span>
                </div>
              </div>
              <div className="relative w-44 h-44 md:w-56 md:h-56 shrink-0">
                 <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_20px_hsl(var(--primary)/0.3)]" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-white/5" />
                   <motion.circle
                     cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10"
                     strokeDasharray="263.89"
                     initial={{ strokeDashoffset: 263.89 }}
                     animate={{ strokeDashoffset: 263.89 - (263.89 * realReadiness) / 100 }}
                     transition={{ duration: 2.5, ease: "circOut" }}
                     className="text-primary"
                     strokeLinecap="round"
                   />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1, duration: 1 }}
                      className="text-6xl font-black tracking-tighter leading-none"
                    >
                      {realReadiness}%
                    </motion.span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">SADC Mastery</span>
                 </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* MILESTONES */}
        <motion.div variants={variants.listItem} className="lg:col-span-4">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-6 relative z-10">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pathfinder Milestones</h3>
                 <div className="space-y-6">
                    {[
                      { label: "Syllabus Load", icon: BookOpen, val: stats.totalQuestions || 0, target: 500 },
                      { label: "Simulator Rank", icon: ShieldCheck, val: realReadiness, target: 100 },
                      { label: "Global Status", icon: Award, val: stats.level || 1, target: 15 }
                    ].map((milestone, idx) => (
                      <div key={idx} className="space-y-3">
                         <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2.5">
                               <milestone.icon className="w-3.5 h-3.5 text-primary" />
                               <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{milestone.label}</span>
                            </div>
                            <span className="text-[9px] font-black text-primary">{Math.min(100, Math.round((milestone.val / milestone.target) * 100))}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (milestone.val / milestone.target) * 100)}%` }} className="h-full bg-primary" />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              <Link href="/test">
                 <Button className="w-full mt-8 h-12 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
                    Initialize Simulation
                 </Button>
              </Link>
           </div>
        </motion.div>

        {/* CORE STATS GRID */}
        <motion.div variants={variants.listItem} className="lg:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Experience", val: stats.xp.toLocaleString(), icon: Zap, color: "text-primary", bg: "bg-primary/5" },
            { label: "System Accuracy", val: `${stats.accuracy}%`, icon: Target, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
            { label: "Current Streak", val: `${stats.streak} Days`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
            { label: "Driver Level", val: `Level ${stats.level}`, icon: Medal, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" }
          ].map((item, idx) => (
            <Card key={idx} className="border-0 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden group hover:ring-primary/40 transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", item.bg)}>
                    <item.icon className={cn("w-5 h-5", item.color)} />
                 </div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{item.label}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white leading-none truncate">{item.val}</p>
                 </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* ACTIVITY & RADAR GRID */}
        <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* WEEKLY ACTIVITY */}
           <motion.div variants={variants.listItem} className="h-full">
              <Card className="border-0 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 h-[350px] md:h-[400px] flex flex-col">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 py-4 px-6 md:py-5 md:px-8">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <CardTitle className="text-sm font-black uppercase tracking-widest">Training Intensity</CardTitle>
                         <CardDescription className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Weekly simulation activity</CardDescription>
                      </div>
                      <Activity className="w-5 h-5 text-primary" />
                   </div>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData}>
                         <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dy={10} />
                         <YAxis hide domain={[0, 'dataMax + 1']} />
                         <Tooltip cursor={{ fill: 'hsl(var(--primary) / 0.05)' }} contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#020617', color: '#fff', fontSize: '10px', fontWeight: 800 }} />
                         <Bar dataKey="tests" radius={[6, 6, 0, 0]} barSize={32}>
                            {activityData.map((_entry: any, index: number) => (
                               <Cell key={`cell-${index}`} fill={index === new Date().getDay() - 1 ? COLORS.primary : '#e2e8f0'} />
                            ))}
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </CardContent>
              </Card>
           </motion.div>

           {/* RADAR CHART */}
           <motion.div variants={variants.listItem} className="h-full">
             <Card className="border-0 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 h-[350px] md:h-[400px] flex flex-col">
               <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 py-4 px-6 md:py-5 md:px-8">
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <CardTitle className="text-sm font-black uppercase tracking-widest">Cognitive Mastery</CardTitle>
                        <CardDescription className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Module proficiency breakdown</CardDescription>
                     </div>
                     <Brain className="w-5 h-5 text-primary" />
                  </div>
               </CardHeader>
               <CardContent className="flex-1 p-6">
                 {categories && categories.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                       <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 800 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Accuracy" dataKey="accuracy" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.15} strokeWidth={3} />
                       <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#020617', color: '#fff', fontSize: '10px', fontWeight: 800 }} />
                     </RadarChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                      <Activity className="w-12 h-12 opacity-10" />
                      <p className="font-black text-[9px] uppercase tracking-widest">Building Data Profile...</p>
                   </div>
                 )}
               </CardContent>
             </Card>
           </motion.div>
        </div>

        {/* WEAK SPOTS */}
        <div className="lg:col-span-12">
          <motion.div variants={variants.listItem}>
            <Card className="border-0 shadow-sm ring-1 ring-red-100 dark:ring-red-950 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
              <CardHeader className="bg-red-50/50 dark:bg-red-500/5 border-b border-red-100 dark:border-red-900/30 py-5 px-8 flex flex-row items-center justify-between">
                 <div className="space-y-1">
                    <CardTitle className="text-sm font-black uppercase text-red-600 tracking-widest">Target Errors</CardTitle>
                    <CardDescription className="text-[8px] font-bold text-red-700/50 uppercase">Critical Knowledge Gaps</CardDescription>
                 </div>
                 <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
              </CardHeader>
              <CardContent className="p-6">
                {weakSpotsLoading ? (<div className="grid grid-cols-1 md:grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>) : weakSpots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {weakSpots.map((spot, i) => (
                      <motion.div key={i} whileHover={{ x: 5 }} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between group cursor-pointer transition-all">
                         <div className="min-w-0 flex-1">
                            <p className="font-black text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">{spot.category}</p>
                            <p className="text-[9px] text-red-600 font-black mt-1 uppercase tracking-tighter">{spot.mistakeCount} Critical Faults</p>
                         </div>
                         <Link href={`/questions?category=${spot.category}`}>
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                               <ChevronRight className="w-4 h-4" />
                            </div>
                         </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                     <ShieldCheck className="w-10 h-10 text-emerald-500 opacity-20" />
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-6">Zero critical failure patterns detected.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ACHIEVEMENT VAULT */}
        <motion.div variants={variants.listItem} className="lg:col-span-12 space-y-5 pt-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <div className="bg-amber-500/20 p-2 rounded-lg text-amber-500"><Trophy size={18} /></div>
               <h2 className="text-xl font-black tracking-tight uppercase">Intelligence Vault</h2>
            </div>
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-right">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
                 <p className="text-[10px] font-black text-slate-900 dark:text-white">{mockBadges.filter(b => b.earned).length}/{mockBadges.length} Active</p>
              </div>
              <div className="w-24 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: `${(mockBadges.filter(b => b.earned).length / mockBadges.length) * 100}%` }} className="h-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockBadges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <motion.div key={i} whileHover={badge.earned ? { y: -5 } : {}} className="relative h-full">
                  <Card className={cn(
                    "border-0 shadow-sm ring-1 h-full transition-all duration-500 rounded-2xl overflow-hidden",
                    badge.earned ? "ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900" : "ring-slate-100/50 dark:ring-white/5 bg-slate-50/50 dark:bg-white/5 opacity-50 grayscale"
                  )}>
                    <CardContent className="p-5 flex flex-col items-center text-center gap-4 h-full relative">
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center shadow-lg relative shrink-0",
                        badge.earned ? `${badge.color} text-white` : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                      )}>
                        <Icon className="w-5 h-5" />
                        {badge.earned && (
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-white rounded-full p-1 shadow-md border border-white dark:border-slate-900">
                             <Star className="w-2 h-2 fill-current" />
                          </motion.div>
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                         <h3 className="font-black text-[10px] uppercase tracking-wider text-slate-900 dark:text-white leading-tight truncate">{badge.name}</h3>
                         <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold leading-snug line-clamp-2">{badge.desc}</p>
                      </div>
                      {!badge.earned && (
                        <div className="w-full mt-auto pt-2">
                           <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-300 dark:bg-slate-700" style={{ width: `${badge.progress}%` }} />
                           </div>
                           <p className="text-[7px] font-black text-slate-400 mt-1 uppercase tracking-widest">{Math.round(badge.progress)}% COMP</p>
                        </div>
                      )}
                      {badge.earned && (
                        <div className="mt-auto pt-2">
                           <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase border border-emerald-100 dark:border-emerald-500/20">Certified</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
