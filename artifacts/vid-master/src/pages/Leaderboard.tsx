import { useState } from "react";
import { useGetLeaderboard, GetLeaderboardPeriod } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Flame, ArrowLeft, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Leaderboard() {
  const [period, setPeriod] = useState<GetLeaderboardPeriod>("weekly");

  const { data: leaderboard, isLoading } = useGetLeaderboard({ period });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-primary text-primary-foreground p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Trophy className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hidden lg:flex text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <Trophy className="w-6 h-6 md:w-8 md:h-8 text-secondary" />
              Nationwide Wall of Excellence
            </h1>
            <p className="text-primary-foreground/80 mt-1 md:mt-2 font-medium text-sm md:text-base">
              The top performers across Zimbabwe mastering the VID curriculum.
            </p>
          </div>
        </div>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as GetLeaderboardPeriod)} className="relative z-10 w-full md:w-auto overflow-x-auto">
          <TabsList className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
            <TabsTrigger value="daily" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">Monthly</TabsTrigger>
            <TabsTrigger value="alltime" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="shadow-lg border-0 ring-1 ring-border">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b bg-muted/30">
            <div className="col-span-2 md:col-span-1 text-center">Rank</div>
            <div className="col-span-6 md:col-span-5">Learner</div>
            <div className="col-span-4 md:col-span-2 text-right">XP / Level</div>
            <div className="hidden md:block col-span-2 text-right">Accuracy</div>
            <div className="hidden md:block col-span-2 text-right">Tests</div>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No entries found for this period. Be the first to take a test!
            </div>
          ) : (
            <div className="divide-y">
              {leaderboard.map((entry, idx) => {
                const isTop3 = entry.rank <= 3;
                return (
                  <div key={entry.userId} className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-muted/20 ${isTop3 ? 'bg-primary/5' : ''}`}>
                    <div className="col-span-2 md:col-span-1 flex justify-center">
                      {entry.rank === 1 ? <Trophy className="w-6 h-6 text-yellow-500" /> :
                       entry.rank === 2 ? <Medal className="w-6 h-6 text-gray-400" /> :
                       entry.rank === 3 ? <Medal className="w-6 h-6 text-amber-700" /> :
                       <span className="font-bold text-muted-foreground text-lg">#{entry.rank}</span>}
                    </div>
                    
                    <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                      <Avatar className={isTop3 ? 'ring-2 ring-primary ring-offset-2' : ''}>
                        {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} alt={entry.name} className="object-cover" />}
                        <AvatarFallback className="font-bold bg-primary/10 text-primary">
                          {entry.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-sm md:text-base">{entry.name}</div>
                        <div className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {entry.city || "Zimbabwe"} • {entry.accuracy}% acc
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-4 md:col-span-2 text-right">
                      <div className="font-bold text-primary flex items-center justify-end gap-1">
                        <Flame className="w-3 h-3 text-secondary" /> {entry.xp.toLocaleString()}
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                        Lvl {entry.level}
                      </div>
                    </div>
                    
                    <div className="hidden md:flex col-span-2 justify-end items-center">
                      <span className="font-bold">{entry.accuracy}%</span>
                    </div>
                    
                    <div className="hidden md:flex col-span-2 justify-end items-center">
                      <span className="font-medium text-muted-foreground">{entry.totalTests}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
