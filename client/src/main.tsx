import { createRoot } from "react-dom/client";
import App from "./App";

console.log('main.tsx is executing');

const rootElement = document.getElementById("root");
console.log('Root element found:', rootElement);

if (rootElement) {
  const root = createRoot(rootElement);
  console.log('Creating React root');
  root.render(<App />);
  console.log('React app rendered');
} else {
  console.error('Root element not found!');
}
