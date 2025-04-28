import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from './hooks/use-auth'; // Corrected import path

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
