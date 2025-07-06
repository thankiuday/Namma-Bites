import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import './App.css'
import Home from './Pages/Home';
import AboutUs from './Pages/AboutUs';
import ContactUs from './Pages/ContactUs';
import Signup from './pages/Signup';
import Login from './Pages/Login';
import UserProfile from './Pages/UserProfile';
import ChangePassword from './Pages/ChangePassword';
import Navbar from './components/user/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/user/ProtectedRoute';
import Cart from './Pages/Cart';
import Orders from './Pages/Orders';
import FoodDetails from './pages/FoodDetails';
import Register from './Pages/Register';

import AdminLogin from './Pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './Pages/AdminDashboard';
import AdminUsers from './Pages/AdminUsers';
import AdminVendors from './Pages/AdminVendors';
import CreateVendor from './Pages/admin/CreateVendor';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VendorLogin from './Pages/VendorLogin';
import VendorDashboard from './Pages/VendorDashboard';
import VendorProfile from './Pages/VendorProfile';
import { VendorAuthProvider, useVendorAuth } from './context/VendorAuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import MenuEntry from './Pages/MenuEntry';
import VendorProtectedRoute from './components/vendor/VendorProtectedRoute';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import VendorDetails from './Pages/VendorDetails';
import Subscription from './Pages/Subscription';
import UserSubscription from './Pages/UserSubscription';

// Placeholder vendor pages
const VendorOrders = () => <div className="bg-white rounded-lg shadow-md p-6">Vendor Orders Page (Coming Soon)</div>;

// Group Vendor routes to be wrapped by its provider
const VendorRoutes = () => (
  <VendorAuthProvider>
    <Routes>
      <Route path="/login" element={<VendorLogin />} />
      <Route path="/dashboard" element={
        <VendorProtectedRoute>
          <VendorDashboard />
        </VendorProtectedRoute>
      } />
      <Route path="/profile" element={
        <VendorProtectedRoute>
          <VendorProfile />
        </VendorProtectedRoute>
      } />
      <Route path="/menu" element={
        <VendorProtectedRoute>
          <MenuEntry />
        </VendorProtectedRoute>
      } />
      <Route path="/menu-entry" element={
        <VendorProtectedRoute>
          <MenuEntry />
        </VendorProtectedRoute>
      } />
      <Route path="/subscription" element={
        <VendorProtectedRoute>
          <Subscription />
        </VendorProtectedRoute>
      } />
    </Routes>
  </VendorAuthProvider>
);

// Group Admin routes to be wrapped by its provider
const AdminRoutes = () => (
  <AdminAuthProvider>
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/register" element={<AdminRegister />} />
      <Route path="/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      <Route path="/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
      <Route path="/vendor" element={<AdminProtectedRoute><AdminVendors /></AdminProtectedRoute>} />
      <Route path="/create-vendor" element={<AdminProtectedRoute><CreateVendor /></AdminProtectedRoute>} />
    </Routes>
  </AdminAuthProvider>
);

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isVendorRoute = location.pathname.startsWith('/vendor');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isAdminRoute && !isVendorRoute && <Navbar />}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public and User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/food/:id" element={<FoodDetails />} />

          {/* User Protected Routes */}
          <Route path="/user" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><UserSubscription /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

          {/* Vendor and Admin Routes */}
          <Route path="/vendor/*" element={<VendorRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/vendor-details/:id" element={<VendorDetails />} />
        </Routes>
      </main>
      {!isAdminRoute && !isVendorRoute && <Footer />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Vendor and Admin routes (do NOT wrap with AuthProvider) */}
        <Route path="/vendor/*" element={<VendorRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        {/* User and public routes (with AuthProvider) */}
        <Route
          path="/*"
          element={
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
