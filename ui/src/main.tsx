import React from "react";
import ReactDOM from "react-dom/client";
import { scan } from "react-scan";
// import { GoogleOAuthProvider } from '@react-oauth/google'
import App from "./App.tsx";
import "./index.css";
// import ENV from './config/env'

// Initialize react-scan for performance monitoring in development
if (import.meta.env.DEV) {
  scan({
    enabled: true,
    log: true,
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* <GoogleOAuthProvider clientId={ENV.GOOGLE_CLIENT_ID}> */}
    <App />
    {/* </GoogleOAuthProvider> */}
  </React.StrictMode>,
);
