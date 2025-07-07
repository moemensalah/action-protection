import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SimpleApp } from "@/components/SimpleApp";

function App() {
  return (
    <ErrorBoundary>
      <SimpleApp />
    </ErrorBoundary>
  );
}

export default App;