import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

window.onerror = function(message, source, lineno, colno, error) {
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h2>Client-side Error:</h2>
      <p><b>Message:</b> ${message}</p>
      <p><b>Source:</b> ${source}:${lineno}:${colno}</p>
      <pre>${error?.stack}</pre>
    </div>
  `;
};

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
