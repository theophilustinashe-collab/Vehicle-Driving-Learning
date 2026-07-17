import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { setAuthTokenGetter, setBaseUrl } from "@roadify/api-client-react";
import { CONFIG, getApiUrl } from "@/lib/config";
import NotFound from "@/pages/not-found";
import React from "react";

// Mobile API Configuration
const isNative = typeof window !== 'undefined' &&
                 (window.navigator.userAgent.includes('Android') ||
                  window.navigator.userAgent.includes('iPhone'));

let apiUrl = getApiUrl(isNative).replace(/\/$/, "");

// [Hybrid API Routing]
if (!__DEV__ && CONFIG.PROD_API_URL) {
  apiUrl = CONFIG.PROD_API_URL;
}

console.log(`[Roadify] Connected to API: ${apiUrl}`);
(window as any).apiUrl = apiUrl;
setBaseUrl(apiUrl);

// Automatic Cloud Fallback for Native/Mobile
if (isNative && typeof window !== 'undefined') {
  fetch(`${apiUrl}/api/healthz`).catch(() => {
    if (apiUrl !== CONFIG.PROD_API_URL && CONFIG.PROD_API_URL) {
      console.warn("[Roadify] Local API unreachable, falling back to Cloud...");
      apiUrl = CONFIG.PROD_API_URL;
      (window as any).apiUrl = apiUrl;
      setBaseUrl(apiUrl);
    }
  });
}

import { AppLayout } from "@/components/layout/AppLayout";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { getSecureToken } from "@/lib/auth-bridge";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import TestPage from "@/pages/Test";
import TestResults from "@/pages/TestResults";
import History from "@/pages/History";
import Signs from "@/pages/Signs";
import Questions from "@/pages/Questions";
import Bookmarks from "@/pages/Bookmarks";
import Leaderboard from "@/pages/Leaderboard";
import Progress from "@/pages/Progress";
import MistakesPage from "@/pages/Mistakes";
import ExamGuidePage from "@/pages/ExamGuide";
import GaragePage from "@/pages/Garage";
import SettingsPage from "@/pages/Settings";
import SupportPage from "@/pages/Support";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManageQuestions from "@/pages/admin/ManageQuestions";
import ManageSigns from "@/pages/admin/ManageSigns";
import ManageUsers from "@/pages/admin/ManageUsers";

// Simple Error Boundary
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background p-4 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
            <p className="text-muted-foreground">The application encountered an unexpected error. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Register the API auth token getter
setAuthTokenGetter(() => getSecureToken());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  useOfflineSync();
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route>
          <AppLayout>
            <ErrorBoundary>
              <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/test" component={TestPage} />
                <Route path="/test/:sessionId/results" component={TestResults} />
                <Route path="/history" component={History} />
                <Route path="/signs" component={Signs} />
                <Route path="/questions" component={Questions} />
                <Route path="/bookmarks" component={Bookmarks} />
                <Route path="/leaderboard" component={Leaderboard} />
                <Route path="/progress" component={Progress} />
                <Route path="/garage" component={GaragePage} />
                <Route path="/mistakes" component={MistakesPage} />
                <Route path="/exam-guide" component={ExamGuidePage} />
                <Route path="/settings" component={SettingsPage} />
                <Route path="/support" component={SupportPage} />
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/admin/questions" component={ManageQuestions} />
                <Route path="/admin/signs" component={ManageSigns} />
                <Route path="/admin/users" component={ManageUsers} />
                <Route component={NotFound} />
              </Switch>
            </ErrorBoundary>
          </AppLayout>
        </Route>
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
