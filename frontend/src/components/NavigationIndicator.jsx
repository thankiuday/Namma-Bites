import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const NavigationIndicator = () => {
  const location = useLocation();

  // Get the current path and determine the indicator position
  const getIndicatorPosition = () => {
    const path = location.pathname;
    
    // Define navigation items and their positions
    const navItems = [
      { path: '/', label: 'Home' },
      { path: '/user', label: 'Profile' },
      { path: '/subscription', label: 'Subscription' },
      { path: '/cart', label: 'Cart' },
      { path: '/orders', label: 'Orders' }
    ];

    const currentIndex = navItems.findIndex(item => item.path === path);
    return currentIndex >= 0 ? currentIndex : -1;
  };

  const currentIndex = getIndicatorPosition();

  if (currentIndex === -1) return null;

  return (
    <motion.div
      className="absolute bottom-0 left-0 h-0.5 bg-orange-600"
      initial={{ width: 0, x: 0 }}
      animate={{ 
        width: '20%', 
        x: `${currentIndex * 20}%`,
        transition: {
          duration: 0.3,
          ease: "easeInOut"
        }
      }}
    />
  );
};

export default NavigationIndicator; 