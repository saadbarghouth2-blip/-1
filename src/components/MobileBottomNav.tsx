import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Home, Search, ShoppingBag, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const DOCK_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function MobileBottomNav() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const { totalItems } = useCart();
  const prefersReducedMotion = useReducedMotion();
  const isRTL = i18n.language === 'ar';

  const navItems = [
    { href: '/', icon: Home, label: isRTL ? 'الرئيسية' : 'Home' },
    { href: '/products', icon: Search, label: isRTL ? 'المنتجات' : 'Products' },
    { href: '/brands', icon: Tag, label: isRTL ? 'العلامات' : 'Brands' },
    { href: '/cart', icon: ShoppingBag, label: isRTL ? 'السلة' : 'Cart', count: totalItems },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname.startsWith(path);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.65rem)] z-50 flex justify-center px-3 sm:px-4 md:hidden">
      <motion.nav
        initial={prefersReducedMotion ? { opacity: 1 } : { y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.16 : 0.42, ease: DOCK_EASE }}
        className="pointer-events-auto w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-[1.9rem] border border-white/60 bg-white/[0.82] p-2 shadow-[0_28px_80px_-34px_rgba(15,23,42,0.5)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),rgba(255,255,255,0)_58%),linear-gradient(180deg,rgba(234,244,252,0.7),rgba(255,255,255,0.72))]" />
          <div className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'right-0' : 'left-0'} w-24 bg-[linear-gradient(90deg,rgba(125,211,252,0.16),rgba(255,255,255,0))] blur-2xl`} />

          <div className="relative grid grid-cols-4 gap-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link key={item.href} to={item.href} className="group relative">
                  {active ? (
                    <motion.span
                      layoutId="bottom-nav-pill"
                      className="absolute inset-0 rounded-[1.35rem] border border-[#78b6df]/80 bg-[#e4f2fb] shadow-[0_18px_34px_-24px_rgba(43,100,140,0.5)]"
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    />
                  ) : null}

                  <span className={`relative flex min-h-[4.6rem] flex-col items-center justify-center gap-1.5 rounded-[1.35rem] px-2 py-2.5 text-center transition-colors ${
                    active ? 'text-[#174369]' : 'text-slate-500 group-hover:text-slate-800'
                  }`}>
                    <span className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                      active ? 'bg-[#2b648c] text-white shadow-[0_12px_24px_-18px_rgba(43,100,140,0.7)]' : 'bg-white/20 text-slate-500'
                    }`}>
                      <item.icon className={`h-5 w-5 transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`} />

                      <AnimatePresence>
                        {item.count !== undefined && item.count > 0 ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-[#153b66] to-[#2b648c] px-1 text-[10px] font-bold text-white shadow-[0_10px_18px_-10px_rgba(21,59,102,0.75)]"
                          >
                            {item.count > 9 ? '9+' : item.count}
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </span>

                    <span className={`max-w-full truncate text-[11px] font-semibold tracking-tight transition-all ${
                      active ? 'opacity-100' : 'opacity-80'
                    }`}>
                      {item.label}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
