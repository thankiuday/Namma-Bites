import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient'; // Using generic apiClient for public endpoints
import { useNavigate } from 'react-router-dom';
import { getVendorImageUrl } from '../utils/imageUtils';
import LazyImage from './LazyImage';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const BrowseVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  // Determine screen size and thresholds
  const getScreenConfig = () => {
    const width = window.innerWidth;
    if (width < 640) return { size: 'mobile', threshold: 3, cols: 2, itemWidth: 80, gap: 12, padding: 32 };
    if (width < 768) return { size: 'sm', threshold: 3, cols: 2, itemWidth: 96, gap: 16, padding: 48 };
    if (width < 1024) return { size: 'md', threshold: 5, cols: 5, itemWidth: 128, gap: 32, padding: 64 };
    return { size: 'lg', threshold: 5, cols: 5, itemWidth: 128, gap: 32, padding: 64 };
  };

  // Calculate container width to show exactly threshold number of vendors
  const getContainerWidth = () => {
    const config = getScreenConfig();
    const totalWidth = config.threshold * (config.itemWidth + config.gap) + config.padding;
    return `${totalWidth}px`;
  };

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/vendor/public');
        if (res.data.success) {
          setVendors(res.data.data);
          const config = getScreenConfig();
          setShowScrollButtons(res.data.data.length > config.threshold);
        } else {
          setError('Failed to fetch vendors.');
        }
      } catch (err) {
        setError('An error occurred while fetching vendors.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const config = getScreenConfig();
      const scrollAmount = config.itemWidth + config.gap;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const config = getScreenConfig();
      const scrollAmount = config.itemWidth + config.gap;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition(); // Initial check
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, [vendors]);

  // Prevent page scroll when scrolling horizontally on mobile
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleTouchMove = (e) => {
      // Simple prevention of horizontal page scroll
      if (container.scrollWidth > container.clientWidth) {
        e.stopPropagation();
      }
    };

    // Add touch event listener
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [vendors]);

  // Handle window resize to update scroll button visibility and screen size
  useEffect(() => {
    const handleResize = () => {
      const config = getScreenConfig();
      setScreenSize(config.size);
      setShowScrollButtons(vendors.length > config.threshold);
      
      // Re-check scroll position after resize
      setTimeout(checkScrollPosition, 100);
    };

    window.addEventListener('resize', handleResize);
    // Set initial screen size
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [vendors.length]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-4"
      >
        Loading vendors...
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-4 text-red-500"
      >
        {error}
      </motion.div>
    );
  }

  const config = getScreenConfig();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-6xl px-4 mb-8"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl md:text-3xl font-bold text-center text-gray-800 mb-4 md:mb-10"
      >
        Browse Our Vendors
      </motion.h2>
      
      <div className="relative">
        {/* Scroll Buttons - Only show if more vendors than threshold */}
        <AnimatePresence>
          {showScrollButtons && (
            <>
              {/* Left Scroll Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`absolute left-1 sm:left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border-2 border-orange-200 flex items-center justify-center transition-all duration-300 ${
                  canScrollLeft 
                    ? 'text-orange-600 hover:bg-orange-50 hover:border-orange-300 hover:shadow-xl' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                whileHover={canScrollLeft ? { scale: 1.1, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" } : {}}
                whileTap={canScrollLeft ? { scale: 0.95 } : {}}
              >
                <FaChevronLeft className="text-xs sm:text-sm md:text-base" />
              </motion.button>

              {/* Right Scroll Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`absolute right-1 sm:right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border-2 border-orange-200 flex items-center justify-center transition-all duration-300 ${
                  canScrollRight 
                    ? 'text-orange-600 hover:bg-orange-50 hover:border-orange-300 hover:shadow-xl' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                whileHover={canScrollRight ? { scale: 1.1, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" } : {}}
                whileTap={canScrollRight ? { scale: 0.95 } : {}}
              >
                <FaChevronRight className="text-xs sm:text-sm md:text-base" />
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Scrollable Container */}
        <div className={showScrollButtons ? 'max-w-5xl mx-auto overflow-x-hidden' : ''}>
          <motion.div 
            ref={scrollContainerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`overflow-x-auto scrollbar-hide ${
              showScrollButtons 
                ? 'flex gap-3 sm:gap-4 md:gap-8 px-8 sm:px-12 md:px-16' // Horizontal scroll layout
                : `grid grid-cols-${config.cols} gap-4 md:gap-8` // Responsive grid layout
            }`}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              // Constrain width to show exactly threshold number of vendors
              ...(showScrollButtons && {
                width: getContainerWidth(),
                minWidth: getContainerWidth()
              }),
              // Prevent horizontal page scroll on mobile
              touchAction: 'pan-y pinch-zoom',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {vendors.map((vendor, index) => (
              <motion.div
                key={vendor._id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.4 + (index * 0.1), 
                  ease: "easeOut" 
                }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className={`flex flex-col items-center group cursor-pointer ${
                  showScrollButtons ? 'flex-shrink-0 w-20 sm:w-24 md:w-32' : ''
                }`}
                onClick={() => navigate(`/vendor-details/${vendor._id}`)}
              >
                <motion.div 
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-orange-600 group-hover:border-orange-500 transition-all duration-300"
                  whileHover={{ 
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <LazyImage
                    src={getVendorImageUrl(vendor.image)}
                    alt={vendor.name}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                  />
                </motion.div>
                <motion.h3 
                  className="mt-2 md:mt-4 text-xs sm:text-base md:text-lg font-medium text-gray-800 group-hover:text-orange-600 transition-colors duration-300 text-center"
                  whileHover={{ 
                    color: "#ea580c", // orange-600
                    transition: { duration: 0.2 }
                  }}
                >
                  {vendor.name}
                </motion.h3>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicators */}
        <AnimatePresence>
          {showScrollButtons && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="flex justify-center mt-4 gap-2"
            >
              <motion.div 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  canScrollLeft ? 'bg-orange-400' : 'bg-gray-300'
                }`}
                animate={{ 
                  scale: canScrollLeft ? 1.2 : 1,
                  opacity: canScrollLeft ? 1 : 0.5
                }}
                transition={{ duration: 0.2 }}
              ></motion.div>
              <motion.div 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  canScrollRight ? 'bg-orange-400' : 'bg-gray-300'
                }`}
                animate={{ 
                  scale: canScrollRight ? 1.2 : 1,
                  opacity: canScrollRight ? 1 : 0.5
                }}
                transition={{ duration: 0.2 }}
              ></motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BrowseVendors;