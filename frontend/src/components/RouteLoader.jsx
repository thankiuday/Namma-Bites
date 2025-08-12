import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

/**
 * Full-screen loader shown briefly on route changes to avoid dark flicker
 * and provide a branded transition experience.
 */
const RouteLoader = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    // Show immediately on path change
    setIsVisible(true);

    // Ensure a minimum visible time to avoid quick flash of the loader
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setIsVisible(false), 700);

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
    // Only respond to path changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999]"
        >
          {/* Soft brand gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100" />

          <div className="relative h-full w-full flex flex-col items-center justify-center">
            <LoadingSpinner size="xl" text="Loading..." />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RouteLoader;


