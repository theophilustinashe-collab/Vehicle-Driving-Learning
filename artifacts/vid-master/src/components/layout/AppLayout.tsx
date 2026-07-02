import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  PlayCircle,
  History as HistoryIcon,
  Signpost,
  BookOpen,
  Bookmark,
  Trophy,
  BarChart,
  Settings,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState, useEffect } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: user, isLoading } = useGetMe({
    query: {
      retry: false,
    } as any
  });
  
  const logout = useLogout();

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("vid_token");
        setLocation("/");
      }
    });
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
    { label: "History", href: "/history", icon: HistoryIcon },
    { label: "Road Signs", href: "/signs", icon: Signpost },
    { label: "Question Bank", href: "/questions", icon: BookOpen },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Progress", href: "/progress", icon: BarChart },
  ];

  const adminItems = [
    { label: "Admin Overview", href: "/admin", icon: ShieldAlert },
    { label: "Manage Questions", href: "/admin/questions", icon: BookOpen },
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
        "fixed inset-y-0 left-0 z-50 w-64 lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out border-r bg-sidebar text-sidebar-foreground flex flex-col shadow-xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-md shadow-sm">
              <Signpost className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">VID Master</h1>
              <p className="text-xs text-sidebar-foreground/70 uppercase tracking-widest font-semibold">Zimbabwe</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div>
            <div className="text-xs font-bold text-sidebar-foreground/40 uppercase tracking-widest mb-4 px-3">
              Learner Hub
            </div>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = location === item.href || location.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "hover:bg-sidebar-accent/30 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className={cn("w-4.5 h-4.5", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {user.role === "admin" && (
            <div>
              <div className="text-xs font-bold text-sidebar-foreground/40 uppercase tracking-widest mb-4 px-3">
                Administration
              </div>
              <nav className="space-y-1.5">
                {adminItems.map((item) => {
                  const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(`${item.href}/`));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "hover:bg-sidebar-accent/30 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className={cn("w-4.5 h-4.5", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50")} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-bold border border-sidebar-primary/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/60 truncate uppercase tracking-tighter">Lvl {user.level} • {user.xp} XP</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg h-11"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-muted/30 relative flex flex-col h-full">
        {/* Mobile Header / Toggle */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b safe-top">
          <div className="flex items-center gap-2">
            {!isDashboard && (
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2 h-9 w-9"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className={cn("p-1.5 rounded-md bg-primary/10", !isDashboard && "hidden sm:block")}>
              <Signpost className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight truncate max-w-[180px]">
              {isDashboard ? "VID Master" : navItems.find(i => location.startsWith(i.href))?.label || "VID Master"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-muted/50 rounded-full"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t z-40 pb-safe shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
          <div className="flex justify-around items-center h-16 px-2">
            {[
              { label: "Home", href: "/dashboard", icon: LayoutDashboard },
              { label: "Tests", href: "/test", icon: PlayCircle },
              { label: "Signs", href: "/signs", icon: Signpost },
              { label: "Progress", href: "/progress", icon: BarChart },
              { label: "More", href: "#", icon: Menu, onClick: () => setIsSidebarOpen(true) },
            ].map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.onClick || (() => setLocation(item.href))}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 gap-1 transition-all py-1 rounded-lg",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-xl transition-all",
                    isActive ? "bg-primary/10 scale-110" : "bg-transparent"
                  )}>
                    <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase tracking-tighter", isActive ? "opacity-100" : "opacity-70")}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}
    </div>
  );
}
