import React, { useRef, useState } from "react";
import gujarati from '../../public/gujarati.jpg';
import tindi from '../../public/tindi.jpg';
import south from '../../public/south.jpg';
import north from '../../public/north.jpg';
import chinese from '../../public/chinese.jpg';
import logo from '../../public/logo.png';
import FoodCard from '../components/FoodCard';
import CategorySection from '../components/CategorySection';
import TopBuys from '../components/TopBuys';
import FoodCategories from '../components/FoodCategories';
import AllFoods from '../components/AllFoods';
import SearchSuggestions from '../components/SearchSuggestions';
import VegToggle from '../components/VegToggle';
import apiClient from '../api/apiClient';
// Joyride tour removed for production build

const Home = () => {
  const categories = [
    {
      name: "Gujarati Nastos",
      image: gujarati
    },
    {
      name: "Namma Tindi Kadai",
      image: tindi
    },
    {
      name: "South Indian",
      image: south
    },
    {
      name: "North Indian",
      image: north
    },
    {
      name: "Chinese",
      image: chinese
    }
  ];

  // Sample food items data
  const foodItems = [
    {
      id: 1,
      name: "Dhokla",
      price: 120,
      category: "Gujarati Nastos",
      image: gujarati,
      isAvailable: true
    },
    {
      id: 2,
      name: "Khandvi",
      price: 150,
      category: "Gujarati Nastos",
      image: gujarati,
      isAvailable: true
    },
    {
      id: 3,
      name: "Masala Dosa",
      price: 80,
      category: "South Indian",
      image: south,
      isAvailable: true
    },
    {
      id: 4,
      name: "Idli Sambar",
      price: 60,
      category: "South Indian",
      image: south,
      isAvailable: false
    },
    {
      id: 5,
      name: "Butter Chicken",
      price: 250,
      category: "North Indian",
      image: north,
      isAvailable: true
    },
    {
      id: 6,
      name: "Noodles",
      price: 180,
      category: "Chinese",
      image: chinese,
      isAvailable: true
    }
  ];

  const topBuysRef = useRef(null);
  const [scrollToType, setScrollToType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [foods, setFoods] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Onboarding tour disabled in production

  // Tour logic removed

  // const handleTourCallback = () => {};

  // const tourSteps = [];

  // Fetch all foods
  React.useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoadingFoods(true);
        const res = await apiClient.get('/vendor/menu-items/all');
        if (res.data.success) setFoods(res.data.data);
      } catch { }
      setLoadingFoods(false);
    };
    fetchFoods();
  }, []);

  // Fetch all vendors
  React.useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        const res = await apiClient.get('/vendor/public');
        if (res.data.success) setVendors(res.data.data);
      } catch { }
      setLoadingVendors(false);
    };
    fetchVendors();
  }, []);

  // Collect unique categories from foods
  const categoriesList = React.useMemo(() => {
    const set = new Set();
    foods.forEach(f => {
      if (f.category) set.add(f.category);
      // Optionally add cuisine types, etc.
    });
    // Add common categories
    set.add('veg');
    set.add('non-veg');
    set.add('vegetarian');
    set.add('non vegetarian');
    return Array.from(set);
  }, [foods]);

  // Handle suggestion selection
  const handleSelectSuggestion = (sugg) => {
    if (!sugg) {
      setShowSuggestions(false);
      return;
    }
    setSearchTerm(sugg.label);
    setShowSuggestions(false);
    // Optionally, navigate to vendor/food page if desired
    // if (sugg.type === 'vendor') navigate(`/vendor-details/${sugg.id}`);
    // if (sugg.type === 'food') navigate(`/food/${sugg.id}`);
  };

  const handleCategoryClick = (type) => {
    setScrollToType(type);
    setTimeout(() => {
      if (topBuysRef.current) {
        topBuysRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); // allow TopBuys to react to prop change
  };

  const handleVegToggle = (vegOnly) => {
    setIsVegOnly(vegOnly);
  };

  return (
    <main className="flex-grow">

      <div className="flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl px-4 mb-12 flex justify-center">
          <img
            src={logo}
            alt="Namma Bites Logo"
            className="h-24 md:h-32 object-contain"
          />
        </div>

        {/* Food Categories */}
        <div className="onboard-categories">
          <FoodCategories />
        </div>

        {/* Search Section - Mobile First */}
        <div className="w-full max-w-7xl px-4 mb-8 md:hidden relative onboard-search">
          {/* FIX: Added items-center to vertically align the children */}
          <div className="flex gap-2 flex-nowrap items-center">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search by food, vendor, or veg/non-veg..."
                className="flex-1 min-w-0 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-600 focus:outline-none text-gray-800 placeholder-gray-400 w-full"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                autoComplete="off"
              />
              <SearchSuggestions
                searchTerm={searchTerm}
                foods={foods}
                vendors={vendors}
                categories={categoriesList}
                onSelectSuggestion={handleSelectSuggestion}
                visible={showSuggestions && searchTerm.length > 0}
              />
            </div>
            {/* Replace search button with veg toggle - make it more compact on mobile */}
            <div className="flex-shrink-0">
              <VegToggle 
                isVegOnly={isVegOnly} 
                onToggle={handleVegToggle}
                className="scale-90 sm:scale-100"
              />
            </div>
          </div>
        </div>
        {/* Search Section - Desktop */}
        <div className="hidden md:block w-full max-w-7xl px-4 mt-12 relative onboard-search">
          <div className="flex gap-4 max-w-3xl mx-auto relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search by food, vendor, or veg/non-veg..."
                className="flex-1 px-6 py-4 rounded-lg border-2 border-gray-200 focus:border-orange-600 focus:outline-none text-gray-800 text-lg placeholder-gray-400 w-full"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                autoComplete="off"
              />
              <SearchSuggestions
                searchTerm={searchTerm}
                foods={foods}
                vendors={vendors}
                categories={categoriesList}
                onSelectSuggestion={handleSelectSuggestion}
                visible={showSuggestions && searchTerm.length > 0}
              />
            </div>
            {/* Replace search button with veg toggle */}
            <VegToggle 
              isVegOnly={isVegOnly} 
              onToggle={handleVegToggle}
            />
          </div>
        </div>

        {/* All Foods Section */}
        <div className="onboard-menu w-full max-w-6xl px-1 sm:px-8 lg:px-8">
          <AllFoods searchTerm={searchTerm} vegFilter={isVegOnly} />
        </div>

        {/* Categories Section */}
        <CategorySection onCategoryClick={handleCategoryClick} />

        {/* Top Buys Section */}
        <div ref={topBuysRef} style={{ width: '100%' }}>
          <TopBuys scrollToType={scrollToType} />
        </div>

      </div>
    </main>
  );
};

export default Home;
