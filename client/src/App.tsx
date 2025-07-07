import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TestComponent } from "@/components/TestComponent";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TestComponent} />
      <Route component={TestComponent} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-white">
          <Router />
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
