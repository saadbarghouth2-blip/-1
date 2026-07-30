import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from '../lib/brand';

const SPLASH_DURATION_MS = 4000;

export default function SplashScreen() {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const hasSeenSplash = window.sessionStorage.getItem('riq-splash-seen') === 'true';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return !hasSeenSplash && !prefersReducedMotion;
  });

  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem('riq-splash-seen', 'true');
      setShow(false);
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
          className="fixed inset-0 z-[10000] overflow-hidden bg-[#eaf6ff]"
        >
          <motion.img
            src="/images/splash-riq-background.png"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 0.34, scale: 1.08 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute -inset-[10%] h-[120%] w-[120%] object-cover object-center blur-2xl md:hidden"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-x-0 bottom-0 top-[29%] overflow-hidden bg-[linear-gradient(180deg,#eef9ff_0%,#d7f0fc_30%,#7dc9ed_68%,#075b96_100%)] md:hidden">
            <div className="absolute -left-[30%] top-[-3.5rem] h-28 w-[160%] rounded-[50%] border-t-[3px] border-white/70 bg-white/35" />
            <div className="absolute -left-[24%] top-[-2.2rem] h-32 w-[150%] rounded-[50%] border-t-2 border-sky-200/80 bg-sky-100/35" />
            <div className="absolute -right-20 bottom-14 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
            <div className="absolute -left-24 bottom-2 h-44 w-64 rounded-full bg-blue-950/15 blur-3xl" />
          </div>
          <motion.img
            src="/images/splash-riq-background.png"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0 h-full w-full object-contain object-top md:object-cover md:object-center"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#032f56]/42 via-[#075b96]/12 to-transparent sm:h-48" />

          {/* Loading Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-10 rounded-[1.15rem] border border-white/80 bg-white/90 p-2.5 shadow-[0_20px_55px_-26px_rgba(3,42,78,0.62)] backdrop-blur-xl sm:inset-x-auto sm:bottom-7 sm:left-1/2 sm:w-[27rem] sm:-translate-x-1/2 sm:rounded-[1.4rem] sm:p-4"
          >
            <div className="flex w-full items-center gap-2.5 sm:gap-3" dir="rtl">
              <motion.div
                animate={{ y: [0, -3, 0], scale: [1, 1.025, 1] }}
                transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[0.85rem] border border-[#2b648c]/20 bg-[linear-gradient(145deg,#153b66,#2b648c)] shadow-[0_12px_26px_-16px_rgba(21,59,102,0.72)] sm:h-16 sm:w-16 sm:rounded-[1rem]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.24),transparent_55%)]" />
                <img
                  src={BRAND_LOGO_SRC}
                  alt={BRAND_LOGO_ALT}
                  className="relative h-full w-full scale-[1.18] object-cover object-center"
                />
              </motion.div>

              <div className="min-w-0 flex-1 text-right">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-black text-[#0b3155] sm:text-base">جاري تجهيز متجر ريق</p>
                  <span className="flex shrink-0 items-center gap-1 text-[9px] font-bold text-[#4b718d] sm:text-[10px]">
                    <motion.span
                      animate={{ opacity: [0.35, 1, 0.35] }}
                      transition={{ duration: 1.1, repeat: Infinity }}
                      className="h-1.5 w-1.5 rounded-full bg-cyan-500"
                    />
                    تحميل
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[9px] font-semibold text-[#58738b] sm:text-xs">مياه نقية وتوصيل أسرع إلى بابك</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#d7e8f4] sm:mt-2.5">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: SPLASH_DURATION_MS / 1000, ease: 'linear' }}
                    className="h-full rounded-full bg-gradient-to-l from-cyan-400 via-sky-500 to-blue-700 shadow-[0_0_12px_rgba(14,165,233,0.55)]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
