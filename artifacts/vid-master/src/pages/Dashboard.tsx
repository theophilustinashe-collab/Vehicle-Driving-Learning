import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlayCircle, Award, Target, Zap, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your progress and get ready for the big day.</p>
        </div>
        <Link href="/test">
          <Button size="lg" className="font-bold gap-2">
            <PlayCircle className="w-5 h-5" />
            Start Mock Exam
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Exam Readiness</CardTitle>
            <Target className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.examReadiness ?? 0}%</div>
            <Progress value={dashboard?.examReadiness ?? 0} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Based on recent test scores
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Zap className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.streak ?? 0} Days</div>
            <p className="text-xs text-muted-foreground mt-3">
              Keep it up! Consistency is key.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.accuracy ?? 0}%</div>
            <Progress value={dashboard?.accuracy ?? 0} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Across all {dashboard?.totalTests ?? 0} tests taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
            <Award className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.rank ?? "Beginner"}</div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-md">Lvl {dashboard?.level ?? 1}</span>
              <span className="text-xs text-muted-foreground">{dashboard?.xp ?? 0} XP</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Test Results</CardTitle>
            <CardDescription>Your last 5 attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {!dashboard?.recentTests || dashboard.recentTests.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                <p className="text-muted-foreground">You haven't taken any tests yet.</p>
                <Link href="/test">
                  <Button variant="outline" className="mt-4">Take your first test</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard.recentTests.map((test) => (
                  <div key={test.sessionId} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${test.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>
                        {test.passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold">Score: {test.score}/{test.total} ({test.percentage}%)</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(test.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${test.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>
                        {test.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Jump to study materials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/signs">
              <div className="p-4 rounded-lg border bg-card hover:border-primary transition-colors cursor-pointer group">
                <h3 className="font-semibold group-hover:text-primary transition-colors">Review Road Signs</h3>
                <p className="text-sm text-muted-foreground mt-1">Memorize regulatory and warning signs.</p>
              </div>
            </Link>
            <Link href="/questions">
              <div className="p-4 rounded-lg border bg-card hover:border-primary transition-colors cursor-pointer group">
                <h3 className="font-semibold group-hover:text-primary transition-colors">Question Bank</h3>
                <p className="text-sm text-muted-foreground mt-1">Browse all possible exam questions.</p>
              </div>
            </Link>
            <Link href="/bookmarks">
              <div className="p-4 rounded-lg border bg-card hover:border-primary transition-colors cursor-pointer group">
                <h3 className="font-semibold group-hover:text-primary transition-colors">Saved for Later</h3>
                <p className="text-sm text-muted-foreground mt-1">Review questions you bookmarked.</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
