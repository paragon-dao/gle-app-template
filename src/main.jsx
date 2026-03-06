import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Builders: consider wrapping <App /> in an ErrorBoundary component
// to catch render errors and show a fallback UI.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
