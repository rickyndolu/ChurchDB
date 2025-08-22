import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useLocation } from "wouter";
import { authManager } from "./lib/auth";
import { useEffect, useState } from "react";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import MembersPage from "@/pages/members";
import FamiliesPage from "@/pages/families";
import DistrictsPage from "@/pages/districts";
import Sidebar from "@/components/layout/sidebar";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authState = authManager.getAuthState();
    setIsAuthenticated(authState.isAuthenticated);
    setIsLoading(false);

    if (!authState.isAuthenticated) {
      setLocation('/login');
    }
  }, [location, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        <ProtectedRoute>
          <Redirect to="/dashboard" />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/members">
        <ProtectedRoute>
          <MembersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/families">
        <ProtectedRoute>
          <FamiliesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/districts">
        <ProtectedRoute>
          <DistrictsPage />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
