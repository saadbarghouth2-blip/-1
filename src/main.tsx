import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { CartProvider } from './context/CartContext';
import { WebAuthProvider } from './features/auth/WebAuthProvider';
import { ensurePwaInstallTracking, registerPwaServiceWorker } from './lib/pwa';
import Maintenance from './pages/Maintenance';

const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isMaintenanceMode ? (
      <Maintenance />
    ) : (
      <WebAuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </WebAuthProvider>
    )}
  </StrictMode>,
);

ensurePwaInstallTracking();
void registerPwaServiceWorker();
