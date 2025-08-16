import React from 'react';
import { motion } from 'framer-motion';
import { FaUtensils, FaHeart, FaUsers, FaStar, FaLeaf, FaShieldAlt, FaTruck, FaClock } from 'react-icons/fa';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, hoverLift } from '../utils/animations';

const AboutUs = () => {
  const features = [
    {
      icon: FaUtensils,
      title: "Fresh & Delicious",
      description: "We partner with the best local vendors to bring you fresh, homemade food every day."
    },
    {
      icon: FaHeart,
      title: "Made with Love",
      description: "Every dish is prepared with care and attention to detail, just like home cooking."
    },
    {
      icon: FaUsers,
      title: "Community First",
      description: "Supporting local vendors and building a strong food community in your area."
    },
    {
      icon: FaStar,
      title: "Quality Assured",
      description: "Rigorous quality checks ensure you get the best food experience every time."
    },
    {
      icon: FaLeaf,
      title: "Eco-Friendly",
      description: "Committed to sustainable practices and reducing our environmental footprint."
    },
    {
      icon: FaShieldAlt,
      title: "Safe & Secure",
      description: "Your safety is our priority with strict hygiene and food safety standards."
    }
  ];

  const stats = [
    { number: "500+", label: "Happy Customers" },
    { number: "50+", label: "Local Vendors" },
    { number: "1000+", label: "Delicious Meals" },
    { number: "24/7", label: "Support" }
  ];

  const team = [
    {
      name: "Our Mission",
      description: "To connect food lovers with authentic local flavors while supporting our community of talented home chefs and small vendors.",
      color: "from-orange-500 to-orange-600"
    },
    {
      name: "Our Vision",
      description: "To become the most trusted platform for discovering and enjoying homemade food, fostering a sustainable food ecosystem.",
      color: "from-orange-600 to-orange-700"
    },
    {
      name: "Our Values",
      description: "Quality, Community, Sustainability, and Innovation drive everything we do at Namma Bites.",
      color: "from-orange-700 to-orange-800"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <main className="pt-8 pb-16">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12 px-4"
        >
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4"
          >
            About Namma Bites
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Connecting food lovers with authentic local flavors. We're more than just a food delivery platform - 
            we're a community that celebrates homemade food and supports local vendors.
          </motion.p>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Story Section */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20"
          >
            <motion.div variants={fadeInLeft} className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Namma Bites was born from a simple idea: everyone deserves access to delicious, 
                  homemade food. In today's fast-paced world, finding authentic, fresh meals can be challenging.
                </p>
                <p>
                  We started as a small initiative to connect local home chefs and food vendors with 
                  food lovers in our community. What began as a passion project has grown into a 
                  thriving platform that supports hundreds of local vendors and serves thousands of happy customers.
                </p>
                <p>
                  Our platform makes it easy for you to discover new flavors, support local businesses, 
                  and enjoy meals that are made with love and care - just like home.
                </p>
              </div>
            </motion.div>
            
            <motion.div variants={fadeInRight} className="relative">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Why Choose Namma Bites?</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <FaHeart className="text-orange-200 mt-1 flex-shrink-0" />
                      <span>Authentic homemade food from local vendors</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FaTruck className="text-orange-200 mt-1 flex-shrink-0" />
                      <span>Fast and reliable delivery service</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FaClock className="text-orange-200 mt-1 flex-shrink-0" />
                      <span>Fresh food prepared daily</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FaShieldAlt className="text-orange-200 mt-1 flex-shrink-0" />
                      <span>Quality and safety guaranteed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Mission, Vision, Values */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {team.map((item, index) => (
              <motion.div
                key={item.name}
                variants={fadeInUp}
                whileHover={hoverLift}
                className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100 hover:border-orange-200 transition-all duration-300"
              >
                <div className={`bg-gradient-to-r ${item.color} p-4 rounded-xl mb-6 inline-block`}>
                  <FaStar className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{item.name}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mb-20"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl font-bold text-gray-800 text-center mb-12"
            >
              What Makes Us Special
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  whileHover={hoverLift}
                  className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:border-orange-200 transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-lg mb-4 inline-block">
                    <feature.icon className="text-white text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-8 mb-20"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl font-bold text-white text-center mb-12"
            >
              Our Impact in Numbers
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-orange-100 text-sm md:text-base">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center bg-white rounded-2xl shadow-xl p-8 border border-orange-100"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Ready to Experience Namma Bites?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have discovered the joy of authentic, 
              homemade food delivered right to their doorstep.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold py-4 px-8 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:shadow-lg"
            >
              Start Ordering Now
            </motion.button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AboutUs;