import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { CartProvider } from './context/CartContext';
import { ProductCatalogProvider } from './features/catalog/ProductCatalogProvider';
import { WebAuthProvider } from './features/auth/WebAuthProvider';
import { ensurePwaInstallTracking, registerPwaServiceWorker } from './lib/pwa';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebAuthProvider>
      <ProductCatalogProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ProductCatalogProvider>
    </WebAuthProvider>
  </StrictMode>,
);

ensurePwaInstallTracking();
void registerPwaServiceWorker();
