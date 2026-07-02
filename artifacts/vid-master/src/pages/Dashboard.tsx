import { useGetDashboard, useGetLeaderboard } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlayCircle, Award, Target, Zap, Clock, CheckCircle2, XCircle, AlertCircle, Trophy, Medal, Flame, History as HistoryIcon, Signpost, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: dashboard, isLoading, error, refetch } = useGetDashboard();
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useGetLeaderboard({ period: "weekly" });

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
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-2xl font-bold text-destructive">Failed to load dashboard</h2>
        <p className="text-muted-foreground text-center max-w-md">
          {error instanceof Error ? error.message : "The connection to the server was refused. Please check if the backend is running."}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          Try Again
        </Button>
      </div>
    );
  }

  const top3 = Array.isArray(leaderboard) ? leaderboard.slice(0, 3) : [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Your Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Track your progress and get ready for the big day.</p>
        </div>
        <Link href="/test" className="w-full md:w-auto">
          <Button size="lg" className="w-full md:w-auto font-bold gap-2 shadow-lg hover:scale-105 transition-transform">
            <PlayCircle className="w-5 h-5" />
            Start Mock Exam
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Exam Readiness</CardTitle>
            <Target className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">{dashboard?.examReadiness ?? 0}%</div>
            <Progress value={dashboard?.examReadiness ?? 0} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-3 font-medium">
              Score 90% to be fully ready
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Study Streak</CardTitle>
            <Zap className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">{dashboard?.streak ?? 0} Days</div>
            <div className="flex items-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={cn("h-1.5 w-full rounded-full", i < (dashboard?.streak || 0) ? "bg-secondary" : "bg-muted")} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-medium">
              Keep the momentum going!
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Avg. Accuracy</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">{dashboard?.accuracy ?? 0}%</div>
            <Progress value={dashboard?.accuracy ?? 0} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-3 font-medium">
              From {dashboard?.totalTests ?? 0} total tests
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Current Level</CardTitle>
            <Award className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">Lv. {dashboard?.level ?? 1}</div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs font-bold px-2 py-0.5 bg-primary/20 text-primary rounded-full uppercase tracking-tighter">{dashboard?.rank ?? "Beginner"}</span>
              <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">{dashboard?.xp ?? 0} XP</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>Your last 5 attempts</CardDescription>
            </div>
            <HistoryIcon className="w-5 h-5 text-muted-foreground opacity-20" />
          </CardHeader>
          <CardContent>
            {!dashboard?.recentTests || dashboard.recentTests.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl bg-muted/20">
                <p className="text-muted-foreground font-medium">No tests taken yet.</p>
                <Link href="/test">
                  <Button variant="outline" className="mt-4 border-primary/20 hover:bg-primary/5">Start First Test</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.recentTests.map((test) => (
                  <div key={test.sessionId} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/30 hover:bg-muted/30 transition-all cursor-default shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-full ${test.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>
                        {test.passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-lg">{test.percentage}%</p>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${test.passed ? 'bg-emerald-500 text-white' : 'bg-destructive text-white'}`}>
                            {test.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground font-medium mt-0.5">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(test.completedAt).toLocaleDateString()} • {test.score}/{test.total} Correct
                        </div>
                      </div>
                    </div>
                    <Link href={`/test/${test.sessionId}/results`}>
                      <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">Review</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-0 shadow-sm ring-1 ring-border">
            <CardHeader>
              <CardTitle className="text-lg">Quick Study</CardTitle>
              <CardDescription>High-impact areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/signs">
                <div className="p-4 rounded-xl border bg-gradient-to-br from-card to-muted/50 hover:border-primary/50 transition-all cursor-pointer group shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-bold group-hover:text-primary transition-colors">Road Signs</h3>
                    <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">Regulatory & Warning</p>
                  </div>
                  <Signpost className="w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
                </div>
              </Link>
              <Link href="/questions">
                <div className="p-4 rounded-xl border bg-gradient-to-br from-card to-muted/50 hover:border-primary/50 transition-all cursor-pointer group shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-bold group-hover:text-primary transition-colors">Question Bank</h3>
                    <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">All Exam Topics</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Leaderboard Preview */}
          <Card className="border-0 shadow-sm ring-1 ring-border bg-gradient-to-b from-primary/5 to-background overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Trophy className="w-16 h-16" />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Top Learners</CardTitle>
                  <CardDescription>This week's leaders</CardDescription>
                </div>
                <Link href="/leaderboard">
                  <Button variant="link" className="text-xs font-bold p-0">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLeaderboardLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {top3.map((entry, idx) => (
                    <div key={entry.userId} className="flex items-center justify-between bg-background/50 p-3 rounded-xl border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-6 text-center">
                          {idx === 0 ? <Trophy className="w-5 h-5 text-yellow-500" /> :
                           idx === 1 ? <Medal className="w-5 h-5 text-gray-400" /> :
                           <Medal className="w-5 h-5 text-amber-700" />}
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {entry.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold truncate max-w-[80px]">{entry.name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-black">Lv {entry.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-primary">{entry.xp.toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
