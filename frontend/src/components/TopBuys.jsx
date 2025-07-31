  import React, { useRef, useEffect, useState } from 'react';
  import FoodCard from './FoodCard';
  import apiClient from '../api/apiClient';

  const TopBuys = ({ scrollToType }) => {
    const vegScrollRef = useRef(null);
    const nonVegScrollRef = useRef(null);
    const [vegItems, setVegItems] = useState([]);
    const [loadingVeg, setLoadingVeg] = useState(true);
    const [vegError, setVegError] = useState('');
    const [nonVegItems, setNonVegItems] = useState([]);
    const [loadingNonVeg, setLoadingNonVeg] = useState(true);
    const [nonVegError, setNonVegError] = useState('');

    useEffect(() => {
      if (scrollToType === 'veg' && vegScrollRef.current) {
        vegScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (scrollToType === 'non-veg' && nonVegScrollRef.current) {
        nonVegScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, [scrollToType]);

    useEffect(() => {
      const fetchVegItems = async () => {
        setLoadingVeg(true);
        setVegError('');
        try {
          const res = await apiClient.get('/vendor/menu-items/veg');
          if (res.data.success) {
            setVegItems(res.data.data);
          } else {
            setVegError(res.data.message || 'Failed to fetch vegetarian items');
          }
        } catch (err) {
          setVegError('Failed to fetch vegetarian items');
        } finally {
          setLoadingVeg(false);
        }
      };
      fetchVegItems();
    }, []);

    useEffect(() => {
      const fetchNonVegItems = async () => {
        setLoadingNonVeg(true);
        setNonVegError('');
        try {
          const res = await apiClient.get('/vendor/menu-items/non-veg');
          if (res.data.success) {
            setNonVegItems(res.data.data);
          } else {
            setNonVegError(res.data.message || 'Failed to fetch non-veg items');
          }
        } catch (err) {
          setNonVegError('Failed to fetch non-veg items');
        } finally {
          setLoadingNonVeg(false);
        }
      };
      fetchNonVegItems();
    }, []);

    const scroll = (direction, ref) => {
      if (ref.current) {
        const { current } = ref;
        const scrollAmount = direction === 'left' ? -400 : 400;
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    return (
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 mt-4 sm:mt-16 mx-auto">
        {/* Top Veg Items */}
        <div className="mb-6 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8 w-full">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-base">V</span>
              </div>
              <h2 className="text-base md:text-xl sm:text-2xl font-semibold text-gray-800">Top Vegetarian Picks</h2>
            </div>
            <div className="flex gap-2 justify-center sm:justify-end">
              <button
                onClick={() => scroll('left', vegScrollRef)}
                className="p-1 sm:p-2 rounded-full bg-orange-600 text-white hover:bg-orange-500 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right', vegScrollRef)}
                className="p-1 sm:p-2 rounded-full bg-orange-600 text-white hover:bg-orange-500 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div 
            ref={vegScrollRef}
            className="flex overflow-x-auto pb-2 sm:pb-4 scrollbar-hide scroll-smooth justify-start pr-2 sm:pr-0 pl-0 gap-2 sm:gap-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loadingVeg ? (
              <div className="text-center w-full py-4 sm:py-8 text-sm sm:text-lg font-semibold text-gray-500">Loading vegetarian items...</div>
            ) : vegError ? (
              <div className="text-center w-full py-4 sm:py-8 text-sm sm:text-lg font-semibold text-red-500">{vegError}</div>
            ) : vegItems.length === 0 ? (
              <div className="text-center w-full py-4 sm:py-8 text-sm sm:text-lg font-semibold text-gray-500">No vegetarian items found.</div>
            ) : (
              vegItems.map((food, idx) => (
                <div key={food._id} className={`flex-none w-44 sm:w-64 md:w-72 h-56 sm:h-64 md:h-72`}>
                  <FoodCard food={food} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Non-Veg Items */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8 w-full">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-base">NV</span>
              </div>
              <h2 className="text-base md:text-xl sm:text-2xl font-semibold text-gray-800">Top Non-Vegetarian Picks</h2>
            </div>
            <div className="flex gap-2 justify-center sm:justify-end">
              <button
                onClick={() => scroll('left', nonVegScrollRef)}
                className="p-1 sm:p-2 rounded-full bg-orange-600 text-white hover:bg-orange-500 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right', nonVegScrollRef)}
                className="p-1 sm:p-2 rounded-full bg-orange-600 text-white hover:bg-orange-500 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div 
            ref={nonVegScrollRef}
            className="flex overflow-x-auto pb-2 sm:pb-4 scrollbar-hide scroll-smooth justify-start pr-2 sm:pr-0 pl-0 gap-2 sm:gap-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loadingNonVeg ? (
              <div className="text-center w-full py-4 sm:py-8 text-sm sm:text-lg font-semibold text-gray-500">Loading non-veg items...</div>
            ) : nonVegError ? (
              <div className="text-center w-full py-4 sm:py-8 text-sm sm:text-lg font-semibold text-red-500">{nonVegError}</div>
            ) : nonVegItems.length === 0 ? (
              <div className="text-center w-full py-4 sm:py-8 text-sm sm:text-lg font-semibold text-gray-500">No non-veg items found.</div>
            ) : (
              nonVegItems.map((food, idx) => (
                <div key={food._id} className={`flex-none w-44 sm:w-64 md:w-72 h-56 sm:h-64 md:h-72`}>
                  <FoodCard food={food} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  export default TopBuys; 