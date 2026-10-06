import { memo, useSyncExternalStore } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const PARTICLE_CONFIGS = Array.from({ length: 6 }, (_, index) => ({
  id: index,
  left: `${(index * 37 + 11) % 100}%`,
  top: `${(index * 53 + 17) % 100}%`,
  travelY: -35 - ((index * 13) % 60),
  scale: 0.8 + ((index * 17) % 12) / 10,
  duration: 6 + ((index * 7) % 4),
  delay: (index * 0.65) % 4,
}));

function subscribeToMobileViewport(callback: () => void) {
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  mediaQuery.addEventListener?.('change', callback);
  return () => mediaQuery.removeEventListener?.('change', callback);
}

function getMobileViewportSnapshot() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function AnimatedBackground() {
  const prefersReducedMotion = useReducedMotion();
  const useStaticBackground = useSyncExternalStore(
    subscribeToMobileViewport,
    getMobileViewportSnapshot,
    () => false,
  );

  if (useStaticBackground || prefersReducedMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50">
        <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-gradient-to-br from-cyan-200/40 to-blue-300/40 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] h-[60%] w-[60%] rounded-full bg-gradient-to-tl from-sky-200/30 to-indigo-200/30 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.25] performance-grid" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50">
      {/* Animated Mesh Gradients */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-br from-cyan-200/40 to-blue-300/40 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-gradient-to-tl from-sky-200/30 to-indigo-200/30 rounded-full blur-[100px]"
      />

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.25] performance-grid"
      />

      {/* Floating Sparkles/Particles */}
      {PARTICLE_CONFIGS.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
          style={{
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            y: [0, particle.travelY],
            opacity: [0, 0.6, 0],
            scale: [0, particle.scale, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export default memo(AnimatedBackground);
