import { useState, useMemo } from "react";
import { useGetLeaderboard, GetLeaderboardPeriod, useGetMe } from "@roadify/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Flame, ArrowLeft, MapPin, Search, Target, TrendingUp, TrendingDown, Minus, Crown, Star, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/native-bridge";
import { cn } from "@/lib/utils";
import { variants, transitions } from "@/lib/motion";

const getTierInfo = (level: number) => {
  if (level >= 50) return { name: "Diamond", color: "text-cyan-400", bg: "bg-cyan-400/10", pattern: "bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]", icon: Crown };
  if (level >= 30) return { name: "Platinum", color: "text-indigo-400", bg: "bg-indigo-400/10", pattern: "bg-[url('https://www.transparenttextures.com/patterns/poligon.png')]", icon: Star };
  if (level >= 20) return { name: "Gold", color: "text-yellow-500", bg: "bg-yellow-500/10", pattern: "bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]", icon: Award };
  if (level >= 10) return { name: "Silver", color: "text-slate-400", bg: "bg-slate-400/10", pattern: "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]", icon: Medal };
  return { name: "Bronze", color: "text-amber-700", bg: "bg-amber-700/10", pattern: "", icon: Target };
};

export default function Leaderboard() {
  const [period, setPeriod] = useState<GetLeaderboardPeriod>("weekly");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: user } = useGetMe();
  const { data: leaderboard, isLoading } = useGetLeaderboard({ period });

  const filteredLeaderboard = useMemo(() => {
    if (!leaderboard) return [];
    return leaderboard.filter(entry =>
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.city && entry.city.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [leaderboard, searchQuery]);

  const top3 = useMemo(() => {
    if (!leaderboard) return [];
    return leaderboard.slice(0, 3);
  }, [leaderboard]);

  const communityTotalXp = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return user?.xp || 0;
    return leaderboard.reduce((acc, p) => acc + (p.xp || 0), 0);
  }, [leaderboard, user]);

  const handlePeriodChange = (v: string) => {
    setPeriod(v as GetLeaderboardPeriod);
    triggerHaptic('light');
  };

  const jumpToMe = () => {
    if (!user) return;
    setSearchQuery(user.name);
    triggerHaptic('medium');
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-32">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-primary uppercase">Elite Hall of Fame</h1>
          <p className="text-muted-foreground font-bold text-xs md:text-sm"> Zimbabwe's top learners competing for road mastery.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-[1.5rem] border shadow-sm">
          <Tabs value={period} onValueChange={handlePeriodChange} className="w-full md:w-auto">
            <TabsList className="bg-slate-100 p-1 h-12 w-full grid grid-cols-4 md:flex md:w-auto">
              <TabsTrigger value="daily" className="font-bold rounded-xl data-[state=active]:shadow-md">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="font-bold rounded-xl data-[state=active]:shadow-md">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="font-bold rounded-xl data-[state=active]:shadow-md">Monthly</TabsTrigger>
              <TabsTrigger value="alltime" className="font-bold rounded-xl data-[state=active]:shadow-md">All Time</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search learners..."
                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-200" onClick={jumpToMe} title="Find me">
              <Target className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </div>
      </div>

      {/* PODIUM SECTION */}
      {!isLoading && !searchQuery && top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 md:gap-8 items-end pt-12 pb-4 px-2">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.gentle, delay: 0.2 }}
            className="flex flex-col items-center gap-3 order-1"
          >
            <div className="relative group">
              <Avatar className="w-16 h-16 md:w-24 md:h-24 border-4 border-slate-300 shadow-xl group-hover:scale-105 transition-transform">
                {(top3[1] as any).avatarUrl && <AvatarImage src={(top3[1] as any).avatarUrl} className="object-cover" />}
                <AvatarFallback className="bg-slate-200 font-black text-slate-600">{top3[1].name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="absolute -top-3 -left-3 bg-slate-300 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white text-xs">2</div>
            </div>
            <div className="text-center">
              <p className="font-black text-xs md:text-sm truncate w-24 md:w-32">{top3[1].name.split(' ')[0]}</p>
              <p className="text-[10px] font-bold text-primary">{(top3[1] as any).xp.toLocaleString()} XP</p>
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 100 }}
              transition={{ ...transitions.default, delay: 0.5 }}
              className="w-full bg-gradient-to-t from-slate-200 via-slate-100 to-white rounded-t-2xl border-x border-t flex items-end justify-center pb-2 relative overflow-hidden"
            >
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
               <Medal className="w-6 h-6 text-slate-400 relative z-10" />
            </motion.div>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="flex flex-col items-center gap-4 order-2 z-10"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] opacity-30"
              >
                <Sparkles className="w-full h-full text-yellow-500" />
              </motion.div>
              <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full scale-150 animate-pulse" />
              <Avatar className="w-20 h-20 md:w-32 md:h-32 border-[6px] border-yellow-400 shadow-2xl relative z-10">
                {(top3[0] as any).avatarUrl && <AvatarImage src={(top3[0] as any).avatarUrl} className="object-cover" />}
                <AvatarFallback className="bg-yellow-50 font-black text-yellow-700 text-xl">{top3[0].name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="absolute -top-4 -left-4 bg-yellow-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg border-[3px] border-white z-20">
                <Crown className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-black text-sm md:text-xl truncate w-28 md:w-48 text-slate-900 drop-shadow-sm">{top3[0].name.split(' ')[0]}</p>
              <p className="text-xs md:text-sm font-black text-yellow-600">{(top3[0] as any).xp.toLocaleString()} XP</p>
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 160 }}
              transition={{ ...transitions.default, delay: 0.4 }}
              className="w-full bg-gradient-to-t from-yellow-400 via-yellow-200 to-yellow-50 rounded-t-3xl border-x border-t flex items-end justify-center pb-6 shadow-[0_-15px_50px_rgba(250,204,21,0.3)] relative overflow-hidden"
            >
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]" />
               <Trophy className="w-12 h-12 text-yellow-600 relative z-10 animate-bounce" />
            </motion.div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.gentle, delay: 0.3 }}
            className="flex flex-col items-center gap-3 order-3"
          >
            <div className="relative group">
              <Avatar className="w-16 h-16 md:w-24 md:h-24 border-4 border-amber-600 shadow-xl group-hover:scale-105 transition-transform">
                {(top3[2] as any).avatarUrl && <AvatarImage src={(top3[2] as any).avatarUrl} className="object-cover" />}
                <AvatarFallback className="bg-amber-50 font-black text-amber-800">{top3[2].name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="absolute -top-3 -left-3 bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white text-xs">3</div>
            </div>
            <div className="text-center">
              <p className="font-black text-xs md:text-sm truncate w-24 md:w-32">{top3[2].name.split(' ')[0]}</p>
              <p className="text-[10px] font-bold text-primary">{(top3[2] as any).xp.toLocaleString()} XP</p>
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 80 }}
              transition={{ ...transitions.default, delay: 0.6 }}
              className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-amber-100 rounded-t-2xl border-x border-t flex items-end justify-center pb-2 relative overflow-hidden"
            >
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
               <Medal className="w-6 h-6 text-amber-200 relative z-10" />
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* PERSONAL PROGRESS SECTION */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-0 shadow-xl bg-slate-900 text-white rounded-[2rem] overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-16 h-16 md:w-20 md:h-20 border-4 border-primary shadow-2xl">
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} className="object-cover" />}
                    <AvatarFallback className="bg-slate-800 text-primary font-black text-xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-slate-900" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Your Standing</p>
                  <h3 className="text-2xl font-black">{user.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-black">{user.xp.toLocaleString()} <span className="text-slate-500 font-bold">XP</span></span>
                    </div>
                    <Badge className={cn("font-black uppercase text-[10px]", getTierInfo(user.level).bg, getTierInfo(user.level).color)}>
                      {getTierInfo(user.level).name} Tier
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-xs w-full space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Rank Progress</span>
                  <span className="text-xs font-black text-primary">{(user.xp % 1000).toLocaleString()} / 1000 XP</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(user.xp % 1000) / 10}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
                  />
                </div>
                <p className="text-[10px] font-bold text-center text-slate-500 uppercase tracking-tighter">Approx. 3 more mock exams to reach <span className="text-white italic">Lvl {user.level + 1}</span></p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* LIST SECTION */}
      <Card className="shadow-2xl border-0 ring-1 ring-slate-200 rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-4 p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b bg-slate-50/50">
            <div className="col-span-2 md:col-span-1 text-center">Rank</div>
            <div className="col-span-6 md:col-span-5">Driver Profile</div>
            <div className="col-span-4 md:col-span-3 text-right">Progress</div>
            <div className="hidden md:block col-span-1 text-right">Trend</div>
            <div className="hidden md:block col-span-2 text-right">Avg Accuracy</div>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-6">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold">No drivers found matching your search.</p>
              <Button variant="ghost" onClick={() => setSearchQuery("")} className="font-black uppercase text-xs text-primary">Clear Search</Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredLeaderboard.map((entry, idx) => {
                  const isMe = entry.userId === user?.id;
                  const tier = getTierInfo(entry.level);
                  const isTop3 = entry.rank <= 3;

                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ backgroundColor: "hsl(var(--primary) / 0.05)", x: 5 }}
                      className={cn(
                        "grid grid-cols-12 gap-4 p-4 md:p-5 items-center transition-all relative group cursor-default",
                        isMe ? "bg-primary/5 ring-2 ring-inset ring-primary/20 z-10" : "border-b border-slate-50"
                      )}
                    >
                      {/* Tier Pattern Overlay */}
                      <div className={cn("absolute inset-0 opacity-[0.02] pointer-events-none transition-opacity group-hover:opacity-[0.05]", tier.pattern)} />

                      <div className="col-span-2 md:col-span-1 flex justify-center relative z-10">
                        {entry.rank === 1 ? (
                          <motion.div
                            animate={{ rotate: [-8, 8, -8], scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="p-1.5 bg-gradient-to-br from-yellow-300 to-yellow-500 text-white rounded-lg shadow-lg border border-yellow-200/50"
                          >
                            <Trophy className="w-5 h-5 drop-shadow-sm" />
                          </motion.div>
                        ) : entry.rank === 2 ? (
                          <div className="p-1.5 bg-gradient-to-br from-slate-200 to-slate-400 text-white rounded-lg shadow-md border border-slate-100/50">
                            <Medal className="w-5 h-5" />
                          </div>
                        ) : entry.rank === 3 ? (
                          <div className="p-1.5 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-lg shadow-md border border-amber-400/50">
                            <Medal className="w-5 h-5" />
                          </div>
                        ) : (
                          <span className="font-black text-slate-300 text-sm md:text-base tabular-nums group-hover:text-primary transition-colors">#{entry.rank}</span>
                        )}
                      </div>

                      <div className="col-span-6 md:col-span-5 flex items-center gap-4 relative z-10">
                        <div className="relative">
                          <Avatar className={cn(
                            "w-10 h-10 md:w-14 md:h-14 border-2 transition-all duration-300 group-hover:scale-105",
                            isTop3 ? "border-primary shadow-lg" : "border-white shadow-sm"
                          )}>
                            {(entry as any).avatarUrl && <AvatarImage src={(entry as any).avatarUrl} alt={entry.name} className="object-cover" />}
                            <AvatarFallback className="font-black bg-slate-100 text-slate-500 text-xs">
                              {entry.name ? entry.name.substring(0, 2).toUpperCase() : '??'}
                            </AvatarFallback>
                          </Avatar>
                          {isMe && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-white flex items-center justify-center shadow-lg"><CheckCircle2 className="w-3 h-3 text-white" /></div>}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("font-black text-sm md:text-lg truncate", isMe ? "text-primary" : "text-slate-900")}>
                              {entry.name}
                            </span>
                            {isMe && <Badge className="bg-primary text-[8px] h-4 font-black px-1.5 shadow-sm">YOU</Badge>}
                          </div>
                          <div className="text-[9px] md:text-xs text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-primary/60" /> {entry.city || "Zimbabwe"}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-4 md:col-span-3 text-right flex flex-col items-end gap-1 relative z-10">
                        <div className="font-black text-slate-900 text-base md:text-xl flex items-center gap-1.5 tabular-nums">
                          <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20" /> {entry.xp.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">XP</span>
                        </div>
                        <div className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border",
                          tier.bg, tier.color, "border-current/10"
                        )}>
                          <tier.icon className="w-3 h-3" />
                          {tier.name} • Lvl {entry.level}
                        </div>
                      </div>

                      <div className="hidden md:flex col-span-1 justify-end items-center relative z-10">
                        {idx % 3 === 0 ? <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2 }}><TrendingUp className="w-5 h-5 text-emerald-500" /></motion.div> :
                         idx % 5 === 0 ? <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2 }}><TrendingDown className="w-5 h-5 text-destructive" /></motion.div> :
                         <Minus className="w-5 h-5 text-slate-200" />}
                      </div>

                      <div className="hidden md:flex col-span-2 justify-end relative z-10">
                        <div className={cn(
                          "px-3 py-1.5 rounded-xl border font-black text-sm shadow-sm tabular-nums transition-all group-hover:scale-105",
                          entry.accuracy >= 95 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5" :
                          entry.accuracy >= 88 ? "bg-primary/10 text-primary border-primary/20 shadow-primary/5" :
                          "bg-slate-900 text-white border-white/10"
                        )}>
                          {entry.accuracy}%
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* STREAK SUMMARY MINI-CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 text-white border-0 shadow-xl rounded-[2rem] p-6 flex items-center gap-4 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Flame className="w-20 h-20 text-orange-500" />
           </div>
           <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/20 z-10">
              <Award className="w-6 h-6 text-white" />
           </div>
           <div className="z-10">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Community Milestone</p>
              <p className="text-sm font-bold mt-0.5">Total XP earned by learners: <span className="text-primary">{communityTotalXp.toLocaleString()} XP</span></p>
           </div>
        </Card>

        <Card className="md:col-span-2 bg-primary text-white border-0 shadow-xl rounded-[2rem] p-6 flex items-center justify-between relative overflow-hidden">
           <div className="flex items-center gap-4">
              <Crown className="w-8 h-8 text-secondary opacity-50" />
              <div>
                <p className="text-xl font-black tracking-tight">Climb higher, drive safer.</p>
                <p className="text-sm font-bold text-white/70">Top 10% this month earn the 'Road Master' profile badge.</p>
              </div>
           </div>
           <Link href="/test">
              <Button className="bg-white text-primary hover:bg-slate-100 font-black px-6 rounded-xl hidden sm:flex">Earn XP Now</Button>
           </Link>
        </Card>
      </div>
    </div>
  );
}
