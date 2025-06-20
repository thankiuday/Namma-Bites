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
import { VendorAuthProvider } from './context/VendorAuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

// Placeholder vendor pages
const VendorMenu = () => <div className="bg-white rounded-lg shadow-md p-6">Vendor Menu Entry Page (Coming Soon)</div>;
const VendorOrders = () => <div className="bg-white rounded-lg shadow-md p-6">Vendor Orders Page (Coming Soon)</div>;
const VendorSubscription = () => <div className="bg-white rounded-lg shadow-md p-6">Vendor Subscription Page (Coming Soon)</div>;

// Vendor routes grouped under a single VendorAuthProvider
const VendorRoutes = () => (
  <VendorAuthProvider>
    <Routes>
      <Route path="/dashboard" element={<VendorDashboard />} />
      <Route path="/menu" element={<VendorMenu />} />
      <Route path="/orders" element={<VendorOrders />} />
      <Route path="/subscription" element={<VendorSubscription />} />
      <Route path="/profile" element={<VendorProfile />} />
    </Routes>
  </VendorAuthProvider>
);

// Admin routes grouped under a single AdminAuthProvider
const AdminRoutes = () => (
  <AdminAuthProvider>
    <Routes>
      <Route path="/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      <Route path="/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
      <Route path="/vendors" element={<AdminProtectedRoute><AdminVendors /></AdminProtectedRoute>} />
      <Route path="/create-vendor" element={<AdminProtectedRoute><CreateVendor /></AdminProtectedRoute>} />
    </Routes>
  </AdminAuthProvider>
);

// AdminProtectedRoute for admin authentication
const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) return null;
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isVendorRoute = location.pathname.startsWith('/vendor');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isAdminRoute && !isVendorRoute && <Navbar />}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/food/:id" element={<FoodDetails />} />
          {/* User protected routes */}
          <Route path="/user" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          {/* Vendor login and vendor protected routes */}
          <Route path="/vendor/login" element={<VendorAuthProvider><VendorLogin /></VendorAuthProvider>} />
          <Route path="/vendor/*" element={<VendorRoutes />} />
          {/* Admin login/register and admin protected routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
