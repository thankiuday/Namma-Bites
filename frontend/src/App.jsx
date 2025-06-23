import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import './App.css'
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Signup from './pages/Signup';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import ChangePassword from './pages/ChangePassword';
import Navbar from './components/user/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/user/ProtectedRoute';
import Subscription from './pages/Subscription';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import FoodDetails from './pages/FoodDetails';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminVendors from './pages/AdminVendors';
import CreateVendor from './pages/admin/CreateVendor';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VendorLogin from './pages/VendorLogin';
import VendorDashboard from './pages/VendorDashboard';
import VendorProfile from './pages/VendorProfile';
import { VendorAuthProvider, useVendorAuth } from './context/VendorAuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

// Placeholder vendor pages
const VendorMenu = () => <div className="bg-white rounded-lg shadow-md p-6">Vendor Menu Entry Page (Coming Soon)</div>;
const VendorOrders = () => <div className="bg-white rounded-lg shadow-md p-6">Vendor Orders Page (Coming Soon)</div>;
const VendorSubscription = () => <div className="bg-white rounded-lg shadow-md p-6">Vendor Subscription Page (Coming Soon)</div>;

// VendorProtectedRoute for vendor authentication
const VendorProtectedRoute = ({ children }) => {
  const { vendor, loading } = useVendorAuth();
  if (loading) return <div>Loading...</div>;
  if (!vendor) {
    return <Navigate to="/vendor/login" replace />;
  }
  return children;
};

// AdminProtectedRoute for admin authentication
const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) return <div>Loading...</div>;
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Group Vendor routes to be wrapped by its provider
const VendorRoutes = () => (
  <VendorAuthProvider>
    <Routes>
      <Route path="/login" element={<VendorLogin />} />
      <Route path="/dashboard" element={<VendorProtectedRoute><VendorDashboard /></VendorProtectedRoute>} />
      <Route path="/menu" element={<VendorProtectedRoute><VendorMenu /></VendorProtectedRoute>} />
      <Route path="/orders" element={<VendorProtectedRoute><VendorOrders /></VendorProtectedRoute>} />
      <Route path="/subscription" element={<VendorProtectedRoute><VendorSubscription /></VendorProtectedRoute>} />
      <Route path="/profile" element={<VendorProtectedRoute><VendorProfile /></VendorProtectedRoute>} />
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
      <Route path="/vendors" element={<AdminProtectedRoute><AdminVendors /></AdminProtectedRoute>} />
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
          <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

          {/* Vendor and Admin Routes */}
          <Route path="/vendor/*" element={<VendorRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
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
