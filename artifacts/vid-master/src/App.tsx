import { useLocation, Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import { Loader2, Zap, WifiOff, Sparkles } from "lucide-react";

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
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Roadify Runtime Error]:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#020617] text-white p-6 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 shadow-xl border border-red-500/30">
            <WifiOff size={32} />
          </div>
          <div className="space-y-2 max-w-sm">
            <h2 className="text-2xl font-black uppercase tracking-tight">Study Space Recovery</h2>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              A temporary display error occurred. Tap below to reload your study space.
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('vid_last_location');
              window.location.reload();
            }}
            className="h-12 px-8 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
          >
            Reload Simulator
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function ComponentLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-6">
      <div className="relative">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-t-2 border-r-2 border-primary rounded-full blur-[1px]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute inset-2 border-b-2 border-l-2 border-primary/40 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Zap size={20} className="text-primary fill-current" />
          </motion.div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Getting things ready</p>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
              className="w-1 h-1 bg-primary rounded-full"
            />
          ))}
        </div>
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

  // Track if we have performed the initial auth-routing check
  // Synchronous boot: If no token exists OR cached user exists, initialize IMMEDIATELY on frame 1
  const [isAuthInitialized, setIsAuthInitialized] = useState(() => {
    return !token || !!getCachedUser();
  });

  // Safety Fallback: Max 300ms splash screen for instant, responsive app launch
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setIsAuthInitialized(true);
    }, 300);
    return () => clearTimeout(splashTimer);
  }, []);

  // Handle 401/Invalid Token ONLY for real server tokens
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

  // Perspective Persistence
  useEffect(() => {
    if (!isPublicRoute && user) {
      localStorage.setItem('vid_last_location', location);
    }
  }, [location, isPublicRoute, user]);

  // Global Auth Enforcement & State Restoration
  useEffect(() => {
    if (token && isServerLoading && !user) return;

    if (user && isPublicRoute) {
      const savedLocation = localStorage.getItem('vid_last_location');
      if (savedLocation && savedLocation !== "/" && !savedLocation.includes('/login')) {
        setLocation(savedLocation);
      } else {
        setLocation("/dashboard");
      }
    } else if (!user && !isPublicRoute) {
      setLocation("/");
    }

    setIsAuthInitialized(true);
  }, [user, isServerLoading, token, isPublicRoute, setLocation]);

  // Captivating Splash Screen: Show ONLY during initial un-initialized boot window
  if (!isAuthInitialized) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#020617] overflow-hidden relative">
        {/* Dynamic Background Elements */}
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
          <motion.div
            animate={{
              scale: [1.3, 1, 1.3],
              opacity: [0.04, 0.1, 0.04],
              rotate: [360, 270, 180, 90, 0]
            }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-indigo-500/20 blur-[130px] rounded-full"
          />

          {/* Technical Grid Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-10 relative z-10"
        >
          <div className="relative">
            {/* Spinning Technical Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute -inset-8 border-2 border-white/5 rounded-[5rem] border-t-primary/20"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute -inset-12 border border-white/5 rounded-[6rem] border-b-indigo-500/20"
            />

            <motion.div
              animate={{
                scale: [0.95, 1.05, 0.95],
                boxShadow: [
                  "0 0 40px hsl(var(--primary) / 0.1)",
                  "0 0 80px hsl(var(--primary) / 0.3)",
                  "0 0 40px hsl(var(--primary) / 0.1)"
                ]
              }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-32 h-32 bg-white p-5 rounded-[4rem] shadow-2xl flex items-center justify-center relative overflow-hidden"
            >
              <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-[2.5rem] relative z-10" />

              {/* Scanning Shine */}
              <motion.div
                animate={{ y: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-primary/20 to-transparent z-20 pointer-events-none"
              />
            </motion.div>
          </div>

          <div className="text-center space-y-4">
            <div className="space-y-1">
              <motion.h2
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-white font-black text-5xl tracking-[0.4em] uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                {user ? user.name.split(' ')[0] : "Roadify"}
              </motion.h2>
              <p className="text-primary font-black text-[10px] uppercase tracking-[0.6em] ml-1">Learning Assistant</p>
            </div>

            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full" />
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
               <motion.div
                 animate={{ opacity: [1, 0.4, 1] }}
                 transition={{ repeat: Infinity, duration: 1.5 }}
                 className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary))]"
               />
               <span className="text-white/40 font-black text-[8px] uppercase tracking-[0.3em]">Connecting to your dashboard</span>
            </div>

            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.4, 1],
                    backgroundColor: ["hsl(var(--primary) / 0.2)", "hsl(var(--primary) / 1)", "hsl(var(--primary) / 0.2)"]
                  }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                  className="w-1 h-1 rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. Main Render Flow
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
  const baseUrl = (import.meta.env.BASE_URL || "").replace(/\/$/, "");
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <WouterRouter base={baseUrl}>
              <AppContent />
            </WouterRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
