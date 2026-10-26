import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initDemoNetworkGuard } from './utils/demoGuard';

// Initialize global Demo Sandbox network guard to block any mutation requests when demo mode is active
initDemoNetworkGuard();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
