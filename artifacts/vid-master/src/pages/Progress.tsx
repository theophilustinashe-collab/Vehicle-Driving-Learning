import { useGetUserStats, useGetCategoryBreakdown } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Target, Activity, CheckSquare, Layers, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Progress() {
  const { data: stats, isLoading: statsLoading } = useGetUserStats();
  const { data: categories, isLoading: catLoading } = useGetCategoryBreakdown();

  if (statsLoading || catLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const activityData = stats.weeklyActivity?.map((val, idx) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx],
    tests: val
  })) || [];

  const radarData = categories?.map(c => ({
    subject: c.category,
    A: c.accuracy,
    fullMark: 100,
  })) || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="hidden lg:flex">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Detailed Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your performance metrics.</p>
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
            <Layers className="w-5 h-5 text-secondary mb-2" />
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Questions Answered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Activity className="w-5 h-5 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tests Completed</div>
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
