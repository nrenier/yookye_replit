
import { useEffect } from "react";
import { Router, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import MainLayout from "@/components/layouts/main-layout";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";
import PackageDetailPage from "@/pages/package-detail-page";
import PreferencesPage from "@/pages/preferences-page";
import BookingsPage from "@/pages/bookings-page";
import ResultsPage from "@/pages/results-page";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <MainLayout>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/packages/:id" component={PackageDetailPage} />
        <Route path="/preferences" component={PreferencesPage} />
        <Route path="/results" component={ResultsPage} />
        <Route path="/bookings">
          <ProtectedRoute path="/bookings" component={BookingsPage} />
        </Route>
        <Route component={NotFound} />
      </MainLayout>
      <Toaster />
    </Router>
    </QueryClientProvider>
  );
}
