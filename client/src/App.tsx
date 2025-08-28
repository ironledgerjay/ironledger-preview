import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";

import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Membership from "@/pages/Membership";
import SearchResults from "@/pages/SearchResults";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancelled from "@/pages/PaymentCancelled";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Index} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/membership" component={Membership} />
      <Route path="/search" component={SearchResults} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/cancelled" component={PaymentCancelled} />
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
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
