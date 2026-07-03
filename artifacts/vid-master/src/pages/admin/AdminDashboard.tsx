import { useGetAdminStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileQuestion, Activity, Target, ArrowLeft, Signpost, Bell, Send, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();
  const { toast } = useToast();
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ title: "", message: "" });

  const handleSendNotification = async () => {
    if (!notifyForm.title || !notifyForm.message) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`${(window as any).apiUrl || "http://localhost:8080"}/api/admin/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("vid_token")}`,
        },
        body: JSON.stringify(notifyForm),
      });

      if (!response.ok) throw new Error("Failed to send");

      toast({ title: "Notification Sent", description: "All learners have been notified." });
      setIsNotifyOpen(false);
      setNotifyForm({ title: "", message: "" });
    } catch (err) {
      toast({ title: "Error sending notification", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hidden lg:flex">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Platform Administration</h1>
            <p className="text-muted-foreground mt-1">System overview and management controls.</p>
          </div>
        </div>
        <Button className="gap-2 font-bold shadow-lg" onClick={() => setIsNotifyOpen(true)}>
          <Bell className="w-4 h-4" /> Push Notification
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total Users</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{stats.activeToday} active today</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Question Bank</CardTitle>
            <FileQuestion className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.totalQuestions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Active test bank items</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Tests Taken</CardTitle>
            <Activity className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.totalTests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Total completions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Global Pass Rate</CardTitle>
            <Target className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.passRate}%</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Platform average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/questions">
          <Card className="hover:border-primary transition-all cursor-pointer group hover:shadow-md ring-1 ring-border border-0">
            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                <FileQuestion className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Manage Questions</h3>
                <p className="text-xs text-muted-foreground mt-1">Edit test bank items</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/signs">
          <Card className="hover:border-primary transition-all cursor-pointer group hover:shadow-md ring-1 ring-border border-0">
            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                <Signpost className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Road Signs</h3>
                <p className="text-xs text-muted-foreground mt-1">Manage sign library</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="hover:border-primary transition-all cursor-pointer group hover:shadow-md ring-1 ring-border border-0">
            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Manage Users</h3>
                <p className="text-xs text-muted-foreground mt-1">View learners & permissions</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Push Notification Dialog */}
      <Dialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <CardTitle>Send Global Notification</CardTitle>
            <CardDescription>This message will be pushed to all learners on the platform.</CardDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-bold">Subject / Title</Label>
              <Input
                placeholder="e.g. New Mock Exam Available!"
                value={notifyForm.title}
                onChange={e => setNotifyForm({...notifyForm, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Message</Label>
              <Textarea
                placeholder="Write your message here..."
                value={notifyForm.message}
                onChange={e => setNotifyForm({...notifyForm, message: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotifyOpen(false)}>Cancel</Button>
            <Button onClick={handleSendNotification} disabled={isSending} className="gap-2 font-bold">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
