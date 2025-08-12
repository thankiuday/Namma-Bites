import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { networkActivity } from '../api/config';

const GlobalActivityOverlay = () => {
  const [activeCount, setActiveCount] = useState(networkActivity.getActiveCount());

  useEffect(() => {
    return networkActivity.subscribe((count) => setActiveCount(count));
  }, []);

  return (
    <AnimatePresence>
      {activeCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-x-0 top-0 z-[9998] pointer-events-none"
        >
          <div className="mx-auto mt-2 w-fit rounded-full bg-black/70 text-white px-3 py-1 text-sm shadow">
            Processing...
          </div>
          <div className="fixed inset-0 -z-10 bg-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalActivityOverlay;


