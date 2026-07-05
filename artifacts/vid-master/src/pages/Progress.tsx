import { useGetUserStats, useGetCategoryBreakdown } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Target, Activity, CheckSquare, Layers, ArrowLeft, Trophy, Medal, Star, ShieldCheck, Zap, Signpost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Progress() {
  const { data: stats, isLoading: statsLoading } = useGetUserStats();
  const { data: categories, isLoading: catLoading } = useGetCategoryBreakdown();

  if (statsLoading || catLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 pb-24">
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center py-20">
        <h2 className="text-xl font-bold">No data available</h2>
        <p className="text-muted-foreground mt-2">Start taking tests to see your progress!</p>
        <Link href="/test">
           <Button className="mt-4">Take a Test</Button>
        </Link>
      </div>
    );
  }

  const activityData = stats.weeklyActivity?.map((val, idx) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx],
    tests: val
  })) || [];

  const radarData = categories?.map(c => ({
    subject: c.category,
    A: c.accuracy,
    fullMark: 100,
  })) || [];

  const mockBadges = [
    {
      name: "Safety First",
      desc: "Complete 10 timed tests to prove your commitment to road safety.",
      icon: ShieldCheck,
      earned: (stats.totalTests >= 10),
      color: "bg-blue-500",
      progress: Math.min(100, (stats.totalTests / 10) * 100)
    },
    {
      name: "Sign Master",
      desc: "Achieve 100% accuracy in the Road Signs category.",
      icon: Signpost,
      earned: (categories?.find(c => c.category.toLowerCase().includes("sign"))?.accuracy === 100),
      color: "bg-emerald-500",
      progress: categories?.find(c => c.category.toLowerCase().includes("sign"))?.accuracy || 0
    },
    {
      name: "Speed Demon",
      desc: "Complete a full mock exam in record time (under 5 minutes).",
      icon: Zap,
      earned: true,
      color: "bg-orange-500",
      progress: 100
    },
    {
      name: "First 100%",
      desc: "Score a perfect 25/25 on any timed mock exam.",
      icon: Trophy,
      earned: (stats.accuracy >= 95),
      color: "bg-yellow-500",
      progress: stats.accuracy
    },
    {
      name: "Steady Learner",
      desc: "Maintain a 5-day study streak to build consistent habits.",
      icon: Activity,
      earned: (stats.streak >= 5),
      color: "bg-purple-500",
      progress: Math.min(100, (stats.streak / 5) * 100)
    },
    {
      name: "Top Scorer",
      desc: "Reach Level 5 by earning experience points through practice.",
      icon: Medal,
      earned: (stats.level >= 5),
      color: "bg-indigo-500",
      progress: Math.min(100, (stats.level / 5) * 100)
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-32">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-2xl border shadow-sm h-11 w-11 animate-car-indicator">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 uppercase">Performance Analytics</h1>
          <p className="text-muted-foreground font-medium">Deep dive into your journey towards getting licensed.</p>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Your Achievements
          </h2>
          <Badge variant="outline" className="font-bold border-primary/20 text-primary">
            {mockBadges.filter(b => b.earned).length} / {mockBadges.length} Unlocked
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockBadges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="relative"
              >
                <Card className={cn(
                  "border-0 shadow-lg ring-1 ring-slate-200/60 h-full transition-all duration-500 rounded-[2rem] overflow-hidden",
                  badge.earned ? "bg-white" : "bg-slate-50/50 opacity-60 grayscale"
                )}>
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3 h-full">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg relative mb-2",
                      badge.earned ? `${badge.color} text-white` : "bg-slate-200 text-slate-400"
                    )}>
                      <Icon className="w-7 h-7" />
                      {badge.earned && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full p-1 shadow-md border-2 border-white">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-[11px] uppercase tracking-wider text-slate-900">{badge.name}</h3>
                      <p className="text-[9px] text-slate-500 font-bold leading-tight line-clamp-2">{badge.desc}</p>
                    </div>

                    {!badge.earned && (
                      <div className="w-full mt-auto pt-2">
                        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-400" style={{ width: `${badge.progress}%` }} />
                        </div>
                        <p className="text-[8px] font-black text-slate-400 mt-1 uppercase">{Math.round(badge.progress)}% COMPLETED</p>
                      </div>
                    )}

                    {badge.earned && (
                      <div className="mt-auto pt-2">
                        <div className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-100">
                          Unlocked
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <Target className="w-5 h-5 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats.examReadiness}%</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Exam Readiness</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <CheckSquare className="w-5 h-5 text-emerald-500 mb-2" />
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Global Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Trophy className="w-5 h-5 text-amber-500 mb-2" />
            <div className="text-2xl font-bold">{(stats as any).masteredQuestions || 0}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mastered Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Layers className="w-5 h-5 text-secondary mb-2" />
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Questions Answered</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Category Mastery</CardTitle>
            <CardDescription>Identify your weak areas across the curriculum</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            {categories && categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Accuracy" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground text-center">Not enough data. Take a test!</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Tests completed this week</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                />
                <Bar dataKey="tests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {categories && categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categories.sort((a, b) => a.accuracy - b.accuracy).map((c) => (
                <div key={c.category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold uppercase text-sm tracking-wider">{c.category}</div>
                    <div className="text-sm font-bold">{c.accuracy}% <span className="text-muted-foreground font-normal ml-2">({c.correct}/{c.total})</span></div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${c.accuracy >= 80 ? 'bg-emerald-500' : c.accuracy >= 60 ? 'bg-primary' : 'bg-destructive'}`} 
                      style={{ width: `${c.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
