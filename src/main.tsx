import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { CartProvider } from './context/CartContext';
import { WebAuthProvider } from './features/auth/WebAuthProvider';
import { ensurePwaInstallTracking, registerPwaServiceWorker } from './lib/pwa';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebAuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </WebAuthProvider>
  </StrictMode>,
);

ensurePwaInstallTracking();
void registerPwaServiceWorker();
