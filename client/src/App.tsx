import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthProvider as NewAuthProvider } from "@/hooks/useAuthNew";
import ErrorBoundary from "@/components/ErrorBoundary";
import EmergencyButton from "@/components/EmergencyButton";

import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Membership from "@/pages/Membership";
import SearchResults from "@/pages/SearchResults";
import DoctorSearch from "@/pages/DoctorSearch";
import DoctorPortal from "@/pages/DoctorPortal";
import Emergency from "@/pages/Emergency";
import Login from "@/pages/Login";
import LoginNew from "@/pages/LoginNew";
import SignupNew from "@/pages/SignupNew";
import EmailVerification from "@/pages/EmailVerification";
import ResetPassword from "@/pages/ResetPassword";
import Signup from "@/pages/Signup";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancelled from "@/pages/PaymentCancelled";
import VerificationPending from "@/pages/VerificationPending";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import BookAppointment from "@/pages/BookAppointment";
import DoctorSignup from "@/pages/DoctorSignup";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Index} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/membership" component={Membership} />
      <Route path="/search" component={SearchResults} />
      <Route path="/doctors" component={DoctorSearch} />
      <Route path="/doctor-portal" component={DoctorPortal} />
      <Route path="/doctor-signup" component={DoctorSignup} />
      <Route path="/book/:doctorId" component={BookAppointment} />
      <Route path="/emergency" component={Emergency} />
      <Route path="/login" component={Login} />
      <Route path="/login-new" component={LoginNew} />
      <Route path="/signup-new" component={SignupNew} />
      <Route path="/verify-email" component={EmailVerification} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/signup" component={Signup} />
      <Route path="/verification-pending" component={VerificationPending} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/cancelled" component={PaymentCancelled} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <NewAuthProvider>
              <Toaster />
              <Router />
              <EmergencyButton />
            </NewAuthProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
