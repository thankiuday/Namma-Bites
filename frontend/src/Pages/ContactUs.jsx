import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      toast.success('Thank you for your message! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <main className="pt-8 pb-16">
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
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </motion.p>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold py-4 px-8 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending Message...' : 'Send Message'}
                </motion.button>
              </form>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: FaPhone, title: 'Phone', details: '+91 98765 43210', subtitle: 'Mon-Fri 9AM-6PM' },
                  { icon: FaEnvelope, title: 'Email', details: 'hello@nammabites.com', subtitle: 'Online support' },
                  { icon: FaMapMarkerAlt, title: 'Office', details: 'Bangalore, Karnataka', subtitle: 'India' },
                  { icon: FaClock, title: 'Working Hours', details: 'Mon - Fri: 9AM - 6PM', subtitle: 'Sat: 10AM - 4PM' }
                ].map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:border-orange-200 transition-all duration-300"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-lg">
                        <info.icon className="text-white text-xl" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-800">{info.title}</h3>
                        <p className="text-sm text-gray-500">{info.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 font-medium">{info.details}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-orange-100"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {[FaFacebook, FaTwitter, FaInstagram].map((Icon, index) => (
                    <motion.a
                      key={index}
                      href="#"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 1.6 + index * 0.1 }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
                    >
                      <Icon className="text-xl" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;
