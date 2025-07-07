import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/hooks/useLanguage";
import { CartProvider } from "@/hooks/useCart";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { TawkWidget } from "@/components/TawkWidget";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Checkout from "@/pages/CheckoutNew";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MyOrders from "@/pages/MyOrders";
import MyAddresses from "@/pages/MyAddresses";
import OrderComplete from "@/pages/OrderComplete";
import WriteReview from "@/pages/WriteReview";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import AdminPanel from "@/pages/AdminPanel";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu" component={Menu} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/my-orders" component={MyOrders} />
      <Route path="/my-addresses" component={MyAddresses} />
      <Route path="/order-complete" component={OrderComplete} />
      <Route path="/write-review" component={WriteReview} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/admin" component={AdminPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminPanel = location === "/admin";

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <CartProvider>
              <TooltipProvider>
                <div className="min-h-screen bg-background theme-transition">
                  <Navbar />
                  <Router />
                  {!isAdminPanel && <TawkWidget />}
                  <Toaster />
                </div>
              </TooltipProvider>
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
