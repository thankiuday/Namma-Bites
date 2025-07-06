import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import PageTransition from './PageTransition';

// Import admin pages
import AdminLogin from '../Pages/AdminLogin';
import AdminRegister from '../pages/AdminRegister';
import AdminDashboard from '../Pages/AdminDashboard';
import AdminUsers from '../Pages/AdminUsers';
import AdminVendors from '../Pages/AdminVendors';
import CreateVendor from '../Pages/admin/CreateVendor';

// Protected Route Components
import AdminProtectedRoute from './admin/AdminProtectedRoute';

const AnimatedAdminRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          <PageTransition>
            <AdminLogin />
          </PageTransition>
        } />
        <Route path="/register" element={
          <PageTransition>
            <AdminRegister />
          </PageTransition>
        } />
        <Route path="/dashboard" element={
          <AdminProtectedRoute>
            <PageTransition>
              <AdminDashboard />
            </PageTransition>
          </AdminProtectedRoute>
        } />
        <Route path="/users" element={
          <AdminProtectedRoute>
            <PageTransition>
              <AdminUsers />
            </PageTransition>
          </AdminProtectedRoute>
        } />
        <Route path="/vendor" element={
          <AdminProtectedRoute>
            <PageTransition>
              <AdminVendors />
            </PageTransition>
          </AdminProtectedRoute>
        } />
        <Route path="/create-vendor" element={
          <AdminProtectedRoute>
            <PageTransition>
              <CreateVendor />
            </PageTransition>
          </AdminProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedAdminRoutes; 