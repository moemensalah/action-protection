import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('main.tsx executing');

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log('React app rendered');
} else {
  console.error('Root element not found');
}
