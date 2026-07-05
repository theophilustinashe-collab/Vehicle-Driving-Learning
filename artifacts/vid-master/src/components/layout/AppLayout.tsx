import { Link, useLocation } from "wouter";
import { useGetMe, useLogout, useListQuestions, useListSigns } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  PlayCircle,
  History as HistoryIcon,
  Octagon,
  BookOpen,
  Bookmark,
  Trophy,
  BarChart,
  Settings,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  ArrowLeft,
  LifeBuoy,
  MessageSquare,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import { syncOfflineData, getLastSyncDate } from "@/lib/offline";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

import logo from "../../assets/logo.png";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading } = useGetMe({
    query: {
      retry: false,
    } as any
  });
  
  // Background data fetchers for sync
  const { data: allQuestions } = useListQuestions({ limit: 1000 }, { query: { enabled: !!user && isOnline } });
  const { data: allSigns } = useListSigns({}, { query: { enabled: !!user && isOnline } });

  const logout = useLogout();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({ title: "Back Online", description: "Your connection has been restored." });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast({ title: "Offline Mode", description: "You are currently offline. Using cached data.", variant: "destructive" });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Automatic Background Sync
  useEffect(() => {
    if (allQuestions && allSigns && isOnline && user) {
      const performSync = async () => {
        setIsSyncing(true);
        const success = await syncOfflineData(allQuestions, allSigns);
        setIsSyncing(false);
        if (success) {
          console.log(`[Offline Sync] Automatic sync complete at ${new Date().toLocaleTimeString()}`);
        }
      };

      // Throttle syncs - only sync if it's been a while or data just arrived
      const lastSync = getLastSyncDate();
      const shouldSync = !lastSync || (new Date().getTime() - new Date(lastSync).getTime() > 1000 * 60 * 30); // Every 30 mins

      if (shouldSync) {
        performSync();
      }
    }
  }, [allQuestions, allSigns, isOnline, user]);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const handleLogout = () => {
    // Clear local state first to ensure immediate responsiveness
    localStorage.removeItem("vid_token");

    // Call API in the background, but don't wait for it to redirect
    logout.mutate(undefined, {
      onSettled: () => {
        setLocation("/");
        window.location.reload(); // Force reload to clear all query caches
      }
    });

    // Fallback redirect if API takes too long
    setTimeout(() => {
      if (window.location.pathname !== "/") {
        setLocation("/");
        window.location.reload();
      }
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Take a Test", href: "/test", icon: PlayCircle },
    { label: "The Garage", href: "/garage", icon: Car },
    { label: "History", href: "/history", icon: HistoryIcon },
    { label: "Road Signs", href: "/signs", icon: Octagon },
    { label: "Question Bank", href: "/questions", icon: BookOpen },
    { label: "Mistake Bank", href: "/mistakes", icon: AlertTriangle },
    { label: "Exam Day Guide", href: "/exam-guide", icon: ClipboardList },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Progress", href: "/progress", icon: BarChart },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Help & Support", href: "/support", icon: LifeBuoy },
  ];

  const adminItems = [
    { label: "Admin Overview", href: "/admin", icon: ShieldAlert },
    { label: "Manage Questions", href: "/admin/questions", icon: BookOpen },
    { label: "Road Signs", href: "/admin/signs", icon: Octagon },
    { label: "Manage Users", href: "/admin/users", icon: Settings },
  ];

  const isDashboard = location === "/dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out border-r bg-sidebar text-sidebar-foreground flex flex-col shadow-2xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-sidebar-border/50 flex items-center justify-between bg-sidebar/50 backdrop-blur-sm">
          <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer group">
            <div className="bg-white p-1 overflow-hidden rounded-xl shadow-md w-11 h-11 flex items-center justify-center border border-sidebar-primary/20 group-hover:scale-105 transition-transform">
              <img src={logo} alt="VID Master Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-black text-xl leading-none tracking-tighter text-white">VID Master</h1>
              <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-[0.2em] font-bold mt-1">Zimbabwe</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground/70 hover:text-white hover:bg-white/10 rounded-2xl w-10 h-10 border border-white/5 shadow-inner active:scale-90 transition-all"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          <div>
            <div className="text-[10px] font-black text-sidebar-foreground/30 uppercase tracking-[0.2em] mb-4 px-3 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-sidebar-foreground/10" />
              Learner Hub
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(`${item.href}`));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold group relative overflow-hidden",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                        : "hover:bg-sidebar-accent/40 text-sidebar-foreground/70 hover:text-white"
                    )}
                  >
                    <Icon className={cn("w-4.5 h-4.5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-sidebar-foreground/40 group-hover:text-primary")} />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-bg"
                        className="absolute inset-0 bg-white/10 -z-10"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {user.role === "admin" && (
            <div>
              <div className="text-[10px] font-black text-sidebar-foreground/30 uppercase tracking-[0.2em] mb-4 px-3 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-sidebar-foreground/10" />
                Administration
              </div>
              <nav className="space-y-1">
                {adminItems.map((item) => {
                  const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(`${item.href}`));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold group relative",
                        isActive
                          ? "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/10 scale-[1.02]"
                          : "hover:bg-sidebar-accent/40 text-sidebar-foreground/70 hover:text-white"
                      )}
                    >
                      <Icon className={cn("w-4.5 h-4.5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-sidebar-foreground/40 group-hover:text-secondary")} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-accent/5 mt-auto">
          <div className="flex items-center gap-4 px-3 mb-6 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-black shadow-lg border border-white/10 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-sidebar ring-1 ring-white/10" />
            </div>
            <div className="truncate flex-1">
              <p className="text-sm font-black text-white truncate">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Lvl {user.level}</span>
                <span className="text-[9px] text-sidebar-foreground/40 font-bold uppercase">{user.xp} XP</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-xl h-12 transition-all font-bold group"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            <LogOut className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col h-full">
        {/* Mobile Header / Toggle */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm safe-top">
          <div className="flex items-center gap-3">
            {!isDashboard && (
              <Button
                variant="ghost"
                size="icon"
                className="-ml-1 h-10 w-10 rounded-2xl hover:bg-slate-100 border border-slate-200 shadow-sm active:scale-95 transition-all"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5 text-slate-700" />
              </Button>
            )}
            <div className={cn(
              "p-0 overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm w-10 h-10 flex items-center justify-center transition-all",
              !isDashboard && "hidden sm:flex hover:scale-105"
            )}>
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tighter text-slate-900 block leading-none">
                {isDashboard ? "VID Master" : navItems.find(i => location.startsWith(i.href))?.label || "VID Master"}
              </span>
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none mt-1 block">Zimbabwe</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isOnline ? (
              <Badge variant="destructive" className="gap-1.5 animate-pulse px-2.5 py-1 h-7 rounded-full text-[10px] font-black uppercase">
                <WifiOff className="w-3 h-3" /> Offline
              </Badge>
            ) : isSyncing ? (
              <Badge variant="outline" className="gap-1.5 px-2.5 py-1 h-7 rounded-full text-[10px] font-black uppercase text-primary border-primary/20 bg-primary/5">
                <RefreshCw className="w-3 h-3 animate-spin" /> Syncing
              </Badge>
            ) : (
              <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 bg-slate-100 rounded-xl hover:bg-slate-200 text-slate-700"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 lg:p-10 pb-24 lg:pb-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-2xl border border-slate-200/80 z-40 pb-safe rounded-3xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="flex justify-around items-center h-20 px-2">
            {[
              { label: "Home", href: "/dashboard", icon: LayoutDashboard },
              { label: "Tests", href: "/test", icon: PlayCircle },
              { label: "Signs", href: "/signs", icon: Octagon },
              { label: "Progress", href: "/progress", icon: BarChart },
              { label: "More", href: "#", icon: Menu, onClick: () => setIsSidebarOpen(true) },
            ].map((item) => {
              const isActive = location === item.href || (item.href !== "/dashboard" && item.href !== "#" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.onClick || (() => setLocation(item.href))}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 gap-1.5 transition-all relative py-2",
                    isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <div className={cn(
                    "p-2.5 rounded-2xl transition-all duration-300",
                    isActive ? "bg-primary text-white shadow-lg shadow-primary/25 scale-110 -translate-y-1" : "bg-transparent"
                  )}>
                    <Icon className={cn("w-5.5 h-5.5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                  </div>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-[0.1em] transition-all",
                    isActive ? "opacity-100 scale-100 mt-0" : "opacity-60 scale-95"
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-dot"
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}
