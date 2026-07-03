import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import React from "react";

// Mobile API Configuration
const isLocal = !window.location.hostname ||
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                /^(\d{1,3}\.){3}\d{1,3}$/.test(window.location.hostname);

// The URL of your Render backend
const renderUrl = 'https://vid-dohn.onrender.com';

let apiUrl = (import.meta.env.VITE_API_URL as string);

// Logic:
// 1. If VITE_API_URL is set (e.g. by Render), use it.
// 2. If we are on localhost/local IP:
//    - If in DEV mode, use the local backend (8080).
//    - If in PROD mode (built locally), still try local backend first, fallback to Render.
// 3. Otherwise, use Render.
if (!apiUrl) {
  if (isLocal) {
    // Check if we should use the local machine IP or just localhost
    const host = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'localhost'
      : window.location.hostname;

    apiUrl = `http://${host}:8080`;
  } else {
    apiUrl = renderUrl;
  }
}

console.log(`[VID Master] API URL set to: ${apiUrl}`);
(window as any).apiUrl = apiUrl;
setBaseUrl(apiUrl);

import { AppLayout } from "@/components/layout/AppLayout";
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
setAuthTokenGetter(() => localStorage.getItem("vid_token"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
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
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
