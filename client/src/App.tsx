import { useEffect } from "react";
import { Router, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layouts/main-layout";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProtectedRoute from "@/lib/protected-route";
import PackageDetailPage from "@/pages/package-detail-page";
import PreferencesPage from "@/pages/preferences-page";
import BookingsPage from "@/pages/bookings-page";
import ResultsPage from "@/pages/results-page";
import NotFound from "@/pages/not-found";
import { login } from "@/lib/api";

export default function App() {
  // Effettua il login all'avvio dell'applicazione
  useEffect(() => {
    const performLogin = async () => {
      try {
        await login();
        console.log("Login effettuato con successo");
      } catch (error) {
        console.error("Errore durante il login automatico:", error);
      }
    };

    performLogin();
  }, []);

  return (
    <Router>
      <MainLayout>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/packages/:id" component={PackageDetailPage} />
        <Route path="/preferences" component={PreferencesPage} />
        <Route path="/results" component={ResultsPage} /> {/* Added ResultsPage route */}
        <Route path="/bookings">
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </MainLayout>
      <Toaster />
    </Router>
  );
}