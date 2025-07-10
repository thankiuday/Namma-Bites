import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import PageTransition from './PageTransition';

// Import vendor pages
import VendorLogin from '../Pages/VendorLogin';
import VendorDashboard from '../Pages/VendorDashboard';
import VendorProfile from '../Pages/VendorProfile';
import MenuEntry from '../Pages/MenuEntry';
import Subscription from '../Pages/Subscription';
import VendorQrScanner from '../Pages/VendorQrScanner';

// Protected Route Components
import VendorProtectedRoute from './vendor/VendorProtectedRoute';

const AnimatedVendorRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          <PageTransition>
            <VendorLogin />
          </PageTransition>
        } />
        <Route path="/dashboard" element={
          <VendorProtectedRoute>
            <PageTransition>
              <VendorDashboard />
            </PageTransition>
          </VendorProtectedRoute>
        } />
        <Route path="/profile" element={
          <VendorProtectedRoute>
            <PageTransition>
              <VendorProfile />
            </PageTransition>
          </VendorProtectedRoute>
        } />
        <Route path="/menu" element={
          <VendorProtectedRoute>
            <PageTransition>
              <MenuEntry />
            </PageTransition>
          </VendorProtectedRoute>
        } />
        <Route path="/menu-entry" element={
          <VendorProtectedRoute>
            <PageTransition>
              <MenuEntry />
            </PageTransition>
          </VendorProtectedRoute>
        } />
        <Route path="/subscription" element={
          <VendorProtectedRoute>
            <PageTransition>
              <Subscription />
            </PageTransition>
          </VendorProtectedRoute>
        } />
        <Route path="/qr-scanner" element={
          <VendorProtectedRoute>
            <PageTransition>
              <VendorQrScanner />
            </PageTransition>
          </VendorProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedVendorRoutes; 