import { Link, useLocation } from "wouter";
import { useGetMe, useLogout, useListQuestions, useListSigns } from "@roadify/api-client-react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  PlayCircle,
  Car,
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
  WifiOff,
  RefreshCw,
  Sun,
  Moon,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import React, { useState, useEffect, useMemo } from "react";
import { variants, transitions } from "@/lib/motion";
import { syncOfflineData, getLastSyncDate, getCachedUser, setCachedUser, clearAllCache, getOfflineQuestions } from "@/lib/offline";
import { setSecureToken } from "@/lib/auth-bridge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Production-ready application layout
import logo from "../../assets/logo.png";

export function AppLayout({ children, user: initialUser }: { children: React.ReactNode, user?: any }) {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Monitor screen size for sidebar logic
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const token = getSecureToken();
  const isGuestToken = !!token && (token.includes('guest') || token.includes('emergency'));

  const { data: serverUser } = useGetMe({
    query: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 mins
      enabled: !!token && !isGuestToken, // Never fetch from server for guest/emergency tokens
    } as any
  });

  // Master User State: Prefer Prop > Server > Cache
  const user = useMemo(() => {
    const baseUser = initialUser || serverUser || getCachedUser();
    if (!baseUser) return null;

    const ADMIN_EMAILS = ["google-user@gmail.com", "admin@roadify.co.zw", "theophilustinashe@gmail.com"];
    if (baseUser.email && ADMIN_EMAILS.includes(baseUser.email.toLowerCase())) {
      return { ...baseUser, role: "admin" };
    }
    return baseUser;
  }, [initialUser, serverUser]);

  // Sync server user to cache when it changes
  useEffect(() => {
    if (serverUser) {
      setCachedUser(serverUser);
    }
  }, [serverUser]);

  // Background data fetchers for sync - reduced limit to prevent DB timeouts
  const { data: allQuestions, refetch: refetchQuestions } = useListQuestions({ limit: 250 }, { query: { enabled: !!user && isOnline, staleTime: 1000 * 60 * 5 } as any });
  const { data: allSigns, refetch: refetchSigns } = useListSigns({ limit: 250 } as any, { query: { enabled: !!user && isOnline, staleTime: 1000 * 60 * 5 } as any });

  const logout = useLogout();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({ title: "Live Link Established", description: "Terminal synchronization active." });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast({ title: "Offline Protocol", description: "Using localized syllabus cache.", variant: "destructive" });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Automatic Background Sync
  useEffect(() => {
    if (allQuestions && allSigns && isOnline && user) {
      const performSync = async () => {
        setIsSyncing(true);
        const success = await syncOfflineData(allQuestions, allSigns);
        setIsSyncing(false);
        if (success) {
          console.log(`[Offline Sync] Automatic sync complete at ${new Date().toLocaleTimeString()}. Questions: ${allQuestions.length}`);
        }
      };

      const lastSync = getLastSyncDate();
      const offlineCount = getOfflineQuestions().length;

      // If we have fewer than 25 questions offline, we definitely need a sync
      const needsInitialSync = !lastSync || (allQuestions.length >= 25 && offlineCount < 25);
      const isStale = lastSync && (new Date().getTime() - new Date(lastSync).getTime() > 1000 * 60 * 30); // Every 30 mins

      if (needsInitialSync || isStale) {
        console.log(`[Offline Sync] Triggering sync. Current count: ${offlineCount}, Server count: ${allQuestions.length}`);
        performSync();
      }
    }
  }, [allQuestions, allSigns, isOnline, user]);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const handleLogout = () => {
    setSecureToken(null);
    clearAllCache();
    logout.mutate(undefined, {
      onSettled: () => {
        setLocation("/");
        window.location.reload();
      }
    });
  };

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

  const normalizedPath = location.split('?')[0].replace(/\/$/, "") || "/";
  const isDashboard = normalizedPath === "/dashboard";

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
         <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const bottomNavItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tests", href: "/test", icon: PlayCircle },
    { label: "Signs", href: "/signs", icon: Octagon },
    { label: "Progress", href: "/progress", icon: BarChart },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const sidebarVariants: Variants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.04,
        delayChildren: 0.1
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 35,
        staggerChildren: 0.03,
        staggerDirection: -1
      }
    }
  };

  const navItemVariants: Variants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    closed: {
      x: -20,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background relative selection:bg-primary/20">
      {/* Global Page Transition Progress Bar */}
      <motion.div
        key={location}
        initial={{ width: "0%", opacity: 1 }}
        animate={{ width: "100%", opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed top-0 left-0 h-0.5 bg-primary z-[1000] pointer-events-none"
      />

      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.06, 0.03],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.02, 0.05, 0.02],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-indigo-500/20 blur-[100px] rounded-full"
        />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants.overlay}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 lg:relative lg:translate-x-0 transition-none flex flex-col shadow-2xl lg:shadow-none",
        !isSidebarOpen && !isDesktop && "pointer-events-none invisible lg:visible"
      )}>
        <motion.div
          initial="closed"
          animate={isDesktop ? "open" : (isSidebarOpen ? "open" : "closed")}
          variants={sidebarVariants}
          className="h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border/50 relative overflow-hidden"
        >
          {/* Sidebar Shine Effect */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-12 pointer-events-none"
          />

          <div className="p-6 border-b border-sidebar-border/50 flex items-center justify-between bg-sidebar/50 backdrop-blur-sm relative z-10">
            <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer group">
              <div className="bg-white p-1.5 overflow-hidden rounded-2xl shadow-[0_8px_20px_-4px_rgba(0,0,0,0.3)] w-12 h-12 flex items-center justify-center border border-white/20 group-hover:scale-105 transition-all duration-500 relative">
                <img src={logo} alt="Roadify Logo" className="w-full h-full object-cover rounded-lg shadow-sm" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </div>
              <div>
                <h1 className="font-black text-2xl leading-none tracking-tighter text-white drop-shadow-sm group-hover:text-primary transition-colors duration-300">Roadify</h1>
                <p className="text-[10px] text-primary uppercase tracking-[0.3em] font-black mt-1 opacity-80 group-hover:opacity-100 transition-opacity">Zimbabwe</p>
              </div>
            </Link>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden h-11 w-11 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all shadow-inner"
            >
              <X className="w-5 h-5" />
            </motion.button>
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
                    <motion.div key={item.href} variants={navItemVariants}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[13px] font-bold group relative overflow-hidden",
                          isActive
                            ? "text-primary-foreground shadow-[0_10px_20px_-5px_hsl(var(--primary)/0.3)] scale-[1.02]"
                            : "hover:bg-white/5 text-sidebar-foreground/60 hover:text-white"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 relative z-10",
                          isActive ? "bg-white/20 shadow-inner" : "bg-white/5 text-sidebar-foreground/30 group-hover:text-primary group-hover:bg-primary/10"
                        )}>
                          <Icon className={cn("w-4.5 h-4.5 transition-transform group-hover:scale-110", isActive && "text-white")} />
                        </div>
                        <span className="relative z-10 tracking-tight">{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="active-nav-bg"
                            className="absolute inset-0 bg-primary"
                            initial={false}
                            transition={transitions.layout}
                          />
                        )}
                      </Link>
                    </motion.div>
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
                      <motion.div key={item.href} variants={navItemVariants}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[13px] font-bold group relative overflow-hidden",
                            isActive
                              ? "text-secondary-foreground shadow-[0_10px_20px_-5px_rgba(var(--secondary),0.3)] scale-[1.02]"
                              : "hover:bg-white/5 text-sidebar-foreground/60 hover:text-white"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 relative z-10",
                            isActive ? "bg-white/20 shadow-inner" : "bg-white/5 text-sidebar-foreground/30 group-hover:text-secondary group-hover:bg-secondary/10"
                          )}>
                            <Icon className={cn("w-4.5 h-4.5 transition-transform group-hover:scale-110", isActive && "text-white")} />
                          </div>
                          <span className="relative z-10 tracking-tight">{item.label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="active-admin-nav-bg"
                              className="absolute inset-0 bg-secondary"
                              initial={false}
                              transition={transitions.layout}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-accent/5 mt-auto">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-[10px] font-black text-sidebar-foreground/30 uppercase tracking-widest">Interface</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 text-sidebar-foreground/50 hover:text-white"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex flex-col gap-3 px-3 mb-6">
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 relative group">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-black shadow-lg border border-white/10 overflow-hidden">
                    {user?.avatarUrl && user.avatarUrl.trim() !== "" ? (
                      <img src={user.avatarUrl} className="w-full h-full object-cover" />
                    ) : (
                      user?.name ? user.name.charAt(0).toUpperCase() : '?'
                    )}
                  </div>
                  {isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-sidebar ring-1 ring-white/10" />
                  )}
                </div>
                <div className="truncate flex-1">
                  <p className="text-sm font-black text-white truncate">{user?.name || "Learner"}</p>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Lvl {user?.level || 1}</span>
                      <span className="text-[9px] text-sidebar-foreground/40 font-bold uppercase">{(user?.xp || 0) % 1000} / 1000 XP</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((user?.xp || 0) % 1000) / 10}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-xl h-12 transition-all font-bold group"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
              Sign Out
            </Button>
          </div>
        </motion.div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col h-full">
        {/* Mobile Header / Toggle */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between p-4 glass-panel shadow-sm safe-top">
          <div className="flex items-center gap-3">
            {!isDashboard && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm active:scale-95 transition-all hover:bg-slate-50 hover:scale-105"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Button>
            )}
            <div className={cn(
              "p-0.5 overflow-hidden rounded-xl bg-white border border-slate-200 shadow-xl w-11 h-11 flex items-center justify-center transition-all",
              !isDashboard && "hidden sm:flex hover:scale-105 shadow-primary/10"
            )}>
              <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tighter text-slate-900 block leading-none">
                {isDashboard ? "Roadify" : navItems.find(i => location.startsWith(i.href))?.label || "Roadify"}
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
              <div className="relative flex h-1.5 w-1.5 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.6)]"></span>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(true)}
              className="h-11 w-11 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] flex items-center justify-center text-slate-900 dark:text-white relative group overflow-hidden active:bg-slate-50 transition-colors"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col gap-1 relative z-10">
                 <span className="w-5 h-0.5 bg-current rounded-full transition-all group-hover:w-4" />
                 <span className="w-4 h-0.5 bg-current rounded-full transition-all group-hover:w-5" />
                 <span className="w-5 h-0.5 bg-current rounded-full transition-all group-hover:w-3" />
              </div>
            </motion.button>
          </div>
        </div>

        <div className="flex-1 p-3 md:p-6 lg:p-8 pb-32 lg:pb-10 safe-bottom">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 liquid-glass z-40 pb-safe rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="flex justify-around items-center h-20 px-1">
            {bottomNavItems.map((item) => {
              const isActive = normalizedPath === item.href || (item.href !== "/dashboard" && normalizedPath.startsWith(item.href));
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => setLocation(item.href)}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 gap-1.5 transition-all relative py-2",
                    isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <motion.div
                    animate={isActive ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
                    transition={transitions.layout}
                    className={cn(
                      "p-2.5 rounded-2xl transition-all duration-300 relative",
                      isActive ? "text-white shadow-xl shadow-primary/30" : "bg-transparent"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 relative z-10", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                    {isActive && (
                      <motion.div
                        layoutId="bottom-nav-active-bg"
                        className="absolute inset-0 bg-primary rounded-2xl"
                        transition={transitions.layout}
                      />
                    )}
                  </motion.div>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-[0.1em] transition-all",
                    isActive ? "opacity-100 scale-105 mt-0" : "opacity-60 scale-100"
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-dot"
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                      transition={transitions.layout}
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
