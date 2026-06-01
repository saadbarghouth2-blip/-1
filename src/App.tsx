import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import './i18n';
import './App.css';

import Navigation from './components/Navigation';
import WebAccountDialog from './components/WebAccountDialog';
import Footer from './sections/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import { InstallButton } from './components/InstallButton';
import SplashScreen from './components/SplashScreen';
import AnimatedBackground from './components/AnimatedBackground';
import MobileBottomNav from './components/MobileBottomNav';
import SeoManager from './components/SeoManager';
import { cancelIdleTask, scheduleIdleTask } from './lib/idle';
import Home from './pages/Home';
import { getRouterBasename } from './lib/site';

const loadProductsPage = () => import('./pages/Products');
const loadProductCatalogGroupPage = () => import('./pages/ProductCatalogGroup');
const loadProductDetailPage = () => import('./pages/ProductDetail');
const loadBrandsPage = () => import('./pages/Brands');
const loadBrandDetailPage = () => import('./pages/BrandDetail');
const loadOffersPage = () => import('./pages/Offers');
const loadContactPage = () => import('./pages/Contact');
const loadAboutPage = () => import('./pages/About');
const loadCartPage = () => import('./pages/Cart');
const loadCheckoutPage = () => import('./pages/Checkout');
const loadMobileCheckoutBridgePage = () => import('./pages/MobileCheckoutBridge');
const loadAppInstallPage = () => import('./pages/AppInstall');
const loadAdminDashboardPage = () => import('./pages/AdminDashboard');
const loadAdminProductsPage = () => import('./pages/AdminProducts');
const loadNotFoundPage = () => import('./pages/NotFound');

const Products = lazy(loadProductsPage);
const ProductCatalogGroup = lazy(loadProductCatalogGroupPage);
const ProductDetail = lazy(loadProductDetailPage);
const Brands = lazy(loadBrandsPage);
const BrandDetail = lazy(loadBrandDetailPage);
const Offers = lazy(loadOffersPage);
const Contact = lazy(loadContactPage);
const About = lazy(loadAboutPage);
const Cart = lazy(loadCartPage);
const Checkout = lazy(loadCheckoutPage);
const MobileCheckoutBridge = lazy(loadMobileCheckoutBridgePage);
const AppInstall = lazy(loadAppInstallPage);
const AdminDashboard = lazy(loadAdminDashboardPage);
const AdminProducts = lazy(loadAdminProductsPage);
const NotFound = lazy(loadNotFoundPage);

const PAGE_TRANSITION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return undefined;
    }

    const targetId = decodeURIComponent(hash.replace('#', ''));
    const scrollToHashTarget = () => {
      const element = document.getElementById(targetId);
      if (!element) {
        return false;
      }

      element.scrollIntoView({ behavior: 'auto', block: 'start' });
      return true;
    };

    if (scrollToHashTarget()) {
      return undefined;
    }

    const timer = window.setTimeout(scrollToHashTarget, 120);
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}

function PageTransition({
  children,
  direction,
  isRTL,
}: {
  children: React.ReactNode;
  direction: number;
  isRTL: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const normalizedDirection = direction === 0 ? 1 : direction;
  const lateralOffset = prefersReducedMotion ? 0 : (isRTL ? -1 : 1) * normalizedDirection * 18;
  const sweepDistance = prefersReducedMotion ? 0 : (isRTL ? -1 : 1) * normalizedDirection * 420;

  return (
    <motion.div
      className="relative isolate"
      initial={prefersReducedMotion ? { opacity: 0.01 } : {
        opacity: 0,
        y: 18,
        x: lateralOffset,
        scale: 0.994,
        filter: 'blur(8px)',
      }}
      animate={prefersReducedMotion ? { opacity: 1 } : {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        filter: 'blur(0px)',
      }}
      exit={prefersReducedMotion ? { opacity: 0.01 } : {
        opacity: 0,
        y: -12,
        x: -lateralOffset * 0.45,
        scale: 1.003,
        filter: 'blur(10px)',
      }}
      transition={{ duration: prefersReducedMotion ? 0.16 : 0.44, ease: PAGE_TRANSITION_EASE }}
    >
      {!prefersReducedMotion ? (
        <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden">
          <motion.div
            className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.5),rgba(255,255,255,0)_68%)]"
            initial={{ opacity: 0.22, y: -10 }}
            animate={{ opacity: 0, y: 0 }}
            exit={{ opacity: 0.08 }}
            transition={{ duration: 0.42, ease: PAGE_TRANSITION_EASE }}
          />
          <motion.div
            className="absolute left-1/2 top-16 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.16),rgba(255,255,255,0)_68%)] blur-3xl"
            initial={{ scale: 0.84, opacity: 0.22 }}
            animate={{ scale: 1.04, opacity: 0 }}
            exit={{ scale: 0.92, opacity: 0.06 }}
            transition={{ duration: 0.54, ease: PAGE_TRANSITION_EASE }}
          />
          <motion.div
            className="absolute inset-y-0 left-1/2 w-[24rem] -translate-x-1/2 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(186,230,253,0.16),rgba(255,255,255,0))] blur-2xl"
            initial={{ x: -sweepDistance, opacity: 0 }}
            animate={{ x: [sweepDistance * -0.18, sweepDistance], opacity: [0, 0.45, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.62, ease: PAGE_TRANSITION_EASE }}
          />
        </div>
      ) : null}

      <motion.div
        className="relative z-10"
        initial={prefersReducedMotion ? undefined : { clipPath: 'inset(0 0 4% 0 round 1.2rem)' }}
        animate={prefersReducedMotion ? undefined : { clipPath: 'inset(0 0 0% 0 round 1.2rem)' }}
        exit={prefersReducedMotion ? undefined : { clipPath: 'inset(2% 0 0% 0 round 1.2rem)' }}
        transition={{ duration: prefersReducedMotion ? 0.16 : 0.4, ease: PAGE_TRANSITION_EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function RouteLoader({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="flex min-h-[45vh] items-center justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/82 px-5 py-3 text-sm font-semibold text-[#153b66] shadow-[0_20px_60px_-34px_rgba(15,23,42,0.38)] backdrop-blur-xl">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#153b66] border-t-transparent" />
        <span>{isRTL ? 'جاري التحميل' : 'Loading'}</span>
      </div>
    </div>
  );
}

function AppContent() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigationType = useNavigationType();
  const isRTL = i18n.language === 'ar';
  const isMobileCheckoutBridge = location.pathname === '/checkout/mobile';
  const hasFloatingNavOffset = !isMobileCheckoutBridge && location.pathname !== '/';
  const routeDirection = navigationType === 'POP' ? -1 : 1;

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRTL]);

  useEffect(() => {
    if (isMobileCheckoutBridge) {
      return undefined;
    }

    const idleHandle = scheduleIdleTask(() => {
      const preloaders = [
        loadProductsPage,
        loadProductCatalogGroupPage,
        loadProductDetailPage,
        loadBrandsPage,
        loadBrandDetailPage,
        loadOffersPage,
        loadContactPage,
        loadAboutPage,
        loadCartPage,
        loadCheckoutPage,
        loadAppInstallPage,
        loadAdminDashboardPage,
        loadAdminProductsPage,
        loadNotFoundPage,
      ];

      void Promise.all(preloaders.map((preload) => preload().catch(() => null)));
    }, 1500);

    return () => {
      cancelIdleTask(idleHandle);
    };
  }, [isMobileCheckoutBridge]);

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden bg-transparent ${
        isMobileCheckoutBridge ? '' : 'pb-[calc(env(safe-area-inset-bottom)+6.75rem)] sm:pb-[calc(env(safe-area-inset-bottom)+6.25rem)] lg:pb-0'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <SeoManager />
      {!isMobileCheckoutBridge && <AnimatedBackground />}
      {!isMobileCheckoutBridge && <SplashScreen />}
      {!isMobileCheckoutBridge && <Navigation />}
      {!isMobileCheckoutBridge && <MobileBottomNav />}
      <ScrollToTop />

      <div className={hasFloatingNavOffset ? 'pt-6 sm:pt-7' : ''}>
        <AnimatePresence initial={false} mode="wait">
          <Suspense fallback={<RouteLoader isRTL={isRTL} />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition direction={routeDirection} isRTL={isRTL}><Home /></PageTransition>} />
              <Route path="/products" element={<PageTransition direction={routeDirection} isRTL={isRTL}><Products /></PageTransition>} />
              <Route path="/products/:groupSlug" element={<PageTransition direction={routeDirection} isRTL={isRTL}><ProductCatalogGroup /></PageTransition>} />
              <Route path="/product/:id" element={<PageTransition direction={routeDirection} isRTL={isRTL}><ProductDetail /></PageTransition>} />
              <Route path="/brands" element={<PageTransition direction={routeDirection} isRTL={isRTL}><Brands /></PageTransition>} />
              <Route path="/brand/:brandId" element={<PageTransition direction={routeDirection} isRTL={isRTL}><BrandDetail /></PageTransition>} />
              <Route path="/offers" element={<PageTransition direction={routeDirection} isRTL={isRTL}><Offers /></PageTransition>} />
              <Route path="/contact" element={<PageTransition direction={routeDirection} isRTL={isRTL}><Contact /></PageTransition>} />
              <Route path="/about" element={<PageTransition direction={routeDirection} isRTL={isRTL}><About /></PageTransition>} />
              <Route path="/cart" element={<PageTransition direction={routeDirection} isRTL={isRTL}><Cart /></PageTransition>} />
              <Route path="/checkout" element={<PageTransition direction={routeDirection} isRTL={isRTL}><Checkout /></PageTransition>} />
              <Route path="/checkout/mobile" element={<PageTransition direction={routeDirection} isRTL={isRTL}><MobileCheckoutBridge /></PageTransition>} />
              <Route path="/app" element={<PageTransition direction={routeDirection} isRTL={isRTL}><AppInstall /></PageTransition>} />
              <Route path="/admin" element={<PageTransition direction={routeDirection} isRTL={isRTL}><AdminDashboard /></PageTransition>} />
              <Route path="/admin/products" element={<PageTransition direction={routeDirection} isRTL={isRTL}><AdminProducts /></PageTransition>} />
              <Route path="*" element={<PageTransition direction={routeDirection} isRTL={isRTL}><NotFound /></PageTransition>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </div>

      {!isMobileCheckoutBridge && <Footer />}
      {!isMobileCheckoutBridge && <WhatsAppButton />}
      {!isMobileCheckoutBridge && <InstallButton />}
      {!isMobileCheckoutBridge && <WebAccountDialog />}
    </div>
  );
}

function App() {
  return (
    <Router basename={getRouterBasename()}>
      <AppContent />
    </Router>
  );
}

export default App;
