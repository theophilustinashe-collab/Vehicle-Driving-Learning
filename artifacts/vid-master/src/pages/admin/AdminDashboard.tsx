import { useGetAdminStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileQuestion, Activity, Target, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="hidden lg:flex">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Platform Administration</h1>
          <p className="text-muted-foreground mt-1">System overview and management controls.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.activeToday} active today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Question Bank</CardTitle>
            <FileQuestion className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalQuestions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Active published questions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform wide total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Global Pass Rate</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.passRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average across all users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/questions">
          <Card className="hover:border-primary transition-colors cursor-pointer group">
            <CardContent className="p-8 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">Manage Questions</h3>
                <p className="text-muted-foreground mt-2">Add, edit, or archive test questions.</p>
              </div>
              <div className="bg-primary/10 p-4 rounded-full text-primary group-hover:scale-110 transition-transform">
                <FileQuestion className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/users">
          <Card className="hover:border-primary transition-colors cursor-pointer group">
            <CardContent className="p-8 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">Manage Users</h3>
                <p className="text-muted-foreground mt-2">View learners and assign admin roles.</p>
              </div>
              <div className="bg-primary/10 p-4 rounded-full text-primary group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
