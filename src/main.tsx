import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Initialize AWS Amplify configuration
import "./utils/aws-config";

createRoot(document.getElementById("root")!).render(<App />);
