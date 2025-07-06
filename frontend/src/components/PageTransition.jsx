import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations';

const PageTransition = ({ children }) => {
  const location = useLocation();

  // Animation for child elements
  const childVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <motion.div
      key={location.pathname}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <motion.div variants={childVariants}>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default PageTransition; 