import { motion } from 'framer-motion';

const AnimatedCard = ({ 
  children, 
  className = '', 
  hover = true,
  onClick,
  ...props 
}) => {
  const baseClasses = `bg-white rounded-lg shadow-md ${className}`;
  
  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: hover ? {
      y: -8,
      scale: 1.04,
      boxShadow: '0 8px 32px 0 rgba(255,140,0,0.15), 0 1.5px 8px 0 rgba(255,140,0,0.10)',
      transition: {
        duration: 0.18,
        ease: "easeOut"
      }
    } : {},
    tap: hover ? {
      scale: 0.97,
      boxShadow: '0 4px 16px 0 rgba(255,140,0,0.10)',
      transition: { duration: 0.12 }
    } : {}
  };

  return (
    <motion.div
      className={baseClasses}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard; 