import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import PageTransition from './PageTransition';

// Import all your pages
import Home from '../Pages/Home';
import AboutUs from '../Pages/AboutUs';
import ContactUs from '../Pages/ContactUs';
import Signup from '../Pages/Signup';
import Login from '../Pages/Login';
import UserProfile from '../Pages/UserProfile';
import ChangePassword from '../Pages/ChangePassword';
import Cart from '../Pages/Cart';
import Orders from '../Pages/Orders';
import Notifications from '../Pages/Notifications';
import NotificationDetail from '../Pages/NotificationDetail';
import FoodDetails from '../Pages/FoodDetails';
import Register from '../Pages/Register';
import VendorDetails from '../Pages/VendorDetails';
import UserSubscription from '../Pages/UserSubscription';
import SubscriptionStart from '../Pages/SubscriptionStart';
import PaymentStatus from '../Pages/PaymentStatus';
import Checkout from '../Pages/Checkout';
import OrderConfirmation from '../Pages/OrderConfirmation';
import ForgotPassword from '../Pages/ForgotPassword';

// Protected Route Components
import ProtectedRoute from './user/ProtectedRoute';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={
          <PageTransition>
            <Home />
          </PageTransition>
        } />
        <Route path="/forgot-password" element={
          <PageTransition>
            <ForgotPassword />
          </PageTransition>
        } />
        <Route path="/about" element={
          <PageTransition>
            <AboutUs />
          </PageTransition>
        } />
        <Route path="/contact" element={
          <PageTransition>
            <ContactUs />
          </PageTransition>
        } />
        <Route path="/signup" element={
          <PageTransition>
            <Signup />
          </PageTransition>
        } />
        <Route path="/login" element={
          <PageTransition>
            <Login />
          </PageTransition>
        } />
        <Route path="/register" element={
          <PageTransition>
            <Register />
          </PageTransition>
        } />
        <Route path="/food/:id" element={
          <PageTransition>
            <FoodDetails />
          </PageTransition>
        } />
        <Route path="/vendor-details/:id" element={
          <PageTransition>
            <VendorDetails />
          </PageTransition>
        } />
        <Route path="/order-confirmation/:orderId" element={
          <PageTransition>
            <OrderConfirmation />
          </PageTransition>
        } />

        {/* Protected User Routes */}
        <Route path="/user" element={
          <ProtectedRoute>
            <PageTransition>
              <UserProfile />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <PageTransition>
              <ChangePassword />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/subscription" element={
          <ProtectedRoute>
            <PageTransition>
              <UserSubscription />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/subscription/start/:planId" element={<SubscriptionStart />} />
        <Route path="/subscription/payment/:subscriptionId" element={<PaymentStatus />} />
        <Route path="/cart" element={
          <ProtectedRoute>
            <PageTransition>
              <Cart />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <PageTransition>
              <Checkout />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <PageTransition>
              <Orders />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <PageTransition>
              <Notifications />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/notifications/:notificationId" element={
          <ProtectedRoute>
            <PageTransition>
              <NotificationDetail />
            </PageTransition>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes; 