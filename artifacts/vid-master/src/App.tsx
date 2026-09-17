import { useLocation, Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider, useTheme } from "next-themes";
import { setAuthTokenGetter, setBaseUrl, useGetMe } from "@roadify/api-client-react";
import { getApiUrl } from "@/lib/config";
import NotFound from "@/pages/not-found";
import React, { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { onNativeThemeChange } from "@/lib/native-bridge";
import { variants, transitions } from "@/lib/motion";
import { getSecureToken, setSecureToken } from "@/lib/auth-bridge";
import { getCachedUser, clearAllCache, setCachedUser } from "@/lib/offline";
import { Loader2, Zap, WifiOff, Sparkles, RefreshCw } from "lucide-react";

// Eager imports for main entry routes to prevent startup chunk load failures
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";

// Lazy Load secondary routes
const TestPage = lazy(() => import("@/pages/Test"));
const TestResults = lazy(() => import("@/pages/TestResults"));
const History = lazy(() => import("@/pages/History"));
const Signs = lazy(() => import("@/pages/Signs"));
const Questions = lazy(() => import("@/pages/Questions"));
const Bookmarks = lazy(() => import("@/pages/Bookmarks"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Progress = lazy(() => import("@/pages/Progress"));
const MistakesPage = lazy(() => import("@/pages/Mistakes"));
const GaragePage = lazy(() => import("@/pages/Garage"));
const ExamGuidePage = lazy(() => import("@/pages/ExamGuide"));
const SettingsPage = lazy(() => import("@/pages/Settings"));
const SupportPage = lazy(() => import("@/pages/Support"));
const AboutCrownweb = lazy(() => import("@/pages/AboutCrownweb"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const SystemHealth = lazy(() => import("@/pages/admin/SystemHealth"));
const ResultsAnalytics = lazy(() => import("@/pages/admin/ResultsAnalytics"));
const ContentManagement = lazy(() => import("@/pages/admin/ContentManagement"));
const AppVersionManager = lazy(() => import("@/pages/admin/AppVersionManager"));
const AuditLogs = lazy(() => import("@/pages/admin/AuditLogs"));
const ManageQuestions = lazy(() => import("@/pages/admin/ManageQuestions"));
const ManageSigns = lazy(() => import("@/pages/admin/ManageSigns"));
const ManageUsers = lazy(() => import("@/pages/admin/ManageUsers"));

import { AppLayout } from "@/components/layout/AppLayout";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import logo from "./assets/logo.png";

// 2. Core API Initialization
const isNative = typeof window !== 'undefined' &&
                 (window.navigator.userAgent.includes('Android') ||
                  window.navigator.userAgent.includes('iPhone'));

const initialApiUrl = getApiUrl(isNative).replace(/\/$/, "");
setBaseUrl(initialApiUrl);
setAuthTokenGetter(() => getSecureToken());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins
    },
  },
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorId?: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorId: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    const errorId = `ERR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[Roadify Diagnostic ${this.state.errorId || 'ERR-BOOT'}]:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#020617] text-white p-6 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 shadow-xl border border-red-500/30">
            <WifiOff size={32} />
          </div>
          <div className="space-y-2 max-w-sm">
            <h2 className="text-2xl font-black uppercase tracking-tight">Roadify Diagnostic Error</h2>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Startup initialization paused. Diagnostic Ref: <code className="text-primary font-mono font-bold">{this.state.errorId || 'ERR-001'}</code>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                localStorage.removeItem('vid_last_location');
                window.location.reload();
              }}
              className="h-11 px-6 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2"
            >
              <RefreshCw size={14} /> Retry Startup
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ComponentLoader() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-2xl animate-pulse" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-7 w-48 rounded-lg" />
          </div>
        </div>
        <Skeleton className="w-full md:w-80 h-20 rounded-2xl" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 space-y-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-5 w-full rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Skeleton className="lg:col-span-8 h-56 rounded-3xl" />
        <Skeleton className="lg:col-span-4 h-56 rounded-3xl" />
      </div>
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="w-full flex-1 flex flex-col origin-top"
      >
        <Suspense fallback={<ComponentLoader />}>
          {children}
        </Suspense>
      </motion.div>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { setTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  const token = getSecureToken();
  const isGuestToken = !!token && (token.includes('guest') || token.includes('emergency'));

  const { data: serverUser, isLoading: isServerLoading, isError } = useGetMe({
    query: {
      retry: 0,
      staleTime: Infinity,
      enabled: !!token && !isGuestToken, // Never fetch from server for guest/emergency tokens
    } as any
  });

  // CRITICAL: Prioritize cache immediately to prevent boot hangs
  const user = useMemo(() => {
    let baseUser = serverUser;
    if (!baseUser && token) {
      baseUser = getCachedUser();
    }
    if (!baseUser) return null;

    const ADMIN_EMAILS = ["google-user@gmail.com", "admin@roadify.co.zw", "theophilustinashe@gmail.com"];
    if (baseUser.email && ADMIN_EMAILS.includes(baseUser.email.toLowerCase())) {
      return { ...baseUser, role: "admin" };
    }
    return baseUser;
  }, [serverUser, token]);

  const [isAuthInitialized, setIsAuthInitialized] = useState(() => {
    return !token || !!getCachedUser();
  });

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setIsAuthInitialized(true);
    }, 300);
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (isError && token && !isGuestToken) {
      console.warn("[Roadify] Token invalid, clearing session...");
      setSecureToken(null);
      clearAllCache();
    }
  }, [isError, token, isGuestToken]);

  useOfflineSync(user);

  useEffect(() => {
    if (serverUser) setCachedUser(serverUser);
  }, [serverUser]);

  useEffect(() => {
    return onNativeThemeChange((theme) => setTheme(theme));
  }, [setTheme]);

  const normalizedPath = location.split('?')[0].replace(/\/$/, "") || "/";
  const isPublicRoute = normalizedPath === "/" || normalizedPath === "/login" || normalizedPath === "/register";

  // Global Auth Enforcement: Ensure app launches to Home screen
  useEffect(() => {
    if (token && isServerLoading && !user) return;

    if (user && isPublicRoute) {
      setLocation("/dashboard");
    } else if (!user && !isPublicRoute) {
      setLocation("/");
    }

    setIsAuthInitialized(true);
  }, [user, isServerLoading, token, isPublicRoute, setLocation]);

  if (!isAuthInitialized) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#020617] overflow-hidden relative">
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.05, 0.12, 0.05],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/30 blur-[140px] rounded-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-10 relative z-10"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute -inset-8 border-2 border-white/5 rounded-[5rem] border-t-primary/20"
            />
            <div className="w-32 h-32 bg-white p-5 rounded-[4rem] shadow-2xl flex items-center justify-center relative overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-[2.5rem] relative z-10" />
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="space-y-1">
              <h2 className="text-white font-black text-5xl tracking-[0.4em] uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {user ? user.name.split(' ')[0] : "Roadify"}
              </h2>
              <p className="text-primary font-black text-[10px] uppercase tracking-[0.6em] ml-1">Learning Assistant</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {isOffline && (
        <div className="bg-orange-500 text-white px-4 py-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest sticky top-0 z-[100]">
          <WifiOff className="w-3 h-3" /> Offline Session
        </div>
      )}

      <Switch>
        {user ? (
          <Route>
            <Switch>
              <Route path="/test"><PageWrapper><TestPage /></PageWrapper></Route>
              <Route path="/test/:sessionId/results"><PageWrapper><TestResults /></PageWrapper></Route>
              <Route>
                <AppLayout user={user}>
                  <Switch>
                    <Route path="/"><PageWrapper><Dashboard /></PageWrapper></Route>
                    <Route path="/dashboard"><PageWrapper><Dashboard /></PageWrapper></Route>
                    <Route path="/history"><PageWrapper><History /></PageWrapper></Route>
                    <Route path="/signs"><PageWrapper><Signs /></PageWrapper></Route>
                    <Route path="/questions"><PageWrapper><Questions /></PageWrapper></Route>
                    <Route path="/bookmarks"><PageWrapper><Bookmarks /></PageWrapper></Route>
                    <Route path="/leaderboard"><PageWrapper><Leaderboard /></PageWrapper></Route>
                    <Route path="/progress"><PageWrapper><Progress /></PageWrapper></Route>
                    <Route path="/garage"><PageWrapper><GaragePage /></PageWrapper></Route>
                    <Route path="/mistakes"><PageWrapper><MistakesPage /></PageWrapper></Route>
                    <Route path="/exam-guide"><PageWrapper><ExamGuidePage /></PageWrapper></Route>
                    <Route path="/settings"><PageWrapper><SettingsPage /></PageWrapper></Route>
                    <Route path="/support"><PageWrapper><SupportPage /></PageWrapper></Route>
                    <Route path="/about"><PageWrapper><AboutCrownweb /></PageWrapper></Route>
                    <Route path="/admin"><PageWrapper><AdminDashboard /></PageWrapper></Route>
                    <Route path="/admin/health"><PageWrapper><SystemHealth /></PageWrapper></Route>
                    <Route path="/admin/analytics"><PageWrapper><ResultsAnalytics /></PageWrapper></Route>
                    <Route path="/admin/content"><PageWrapper><ContentManagement /></PageWrapper></Route>
                    <Route path="/admin/versions"><PageWrapper><AppVersionManager /></PageWrapper></Route>
                    <Route path="/admin/audit-logs"><PageWrapper><AuditLogs /></PageWrapper></Route>
                    <Route path="/admin/questions"><PageWrapper><ManageQuestions /></PageWrapper></Route>
                    <Route path="/admin/signs"><PageWrapper><ManageSigns /></PageWrapper></Route>
                    <Route path="/admin/users"><PageWrapper><ManageUsers /></PageWrapper></Route>
                    <Route><PageWrapper><NotFound /></PageWrapper></Route>
                  </Switch>
                </AppLayout>
              </Route>
            </Switch>
          </Route>
        ) : (
          <Route>
            <Switch>
              <Route path="/"><PageWrapper><Home /></PageWrapper></Route>
              <Route path="/login"><PageWrapper><Home /></PageWrapper></Route>
              <Route path="/register"><PageWrapper><Home /></PageWrapper></Route>
              <Route><PageWrapper><Home /></PageWrapper></Route>
            </Switch>
          </Route>
        )}
      </Switch>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <WouterRouter hook={useHashLocation}>
              <AppContent />
            </WouterRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
