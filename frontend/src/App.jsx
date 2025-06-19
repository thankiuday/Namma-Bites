import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import './App.css'
import Home from './Pages/Home';
import AboutUs from './Pages/AboutUs';
import ContactUs from './Pages/ContactUs';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import UserProfile from './Pages/UserProfile';
import ChangePassword from './Pages/ChangePassword';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Subscription from './Pages/Subscription';
import Cart from './Pages/Cart';
import Orders from './Pages/Orders';
import FoodDetails from './Pages/FoodDetails';
import Register from './Pages/Register';
import AdminLogin from './Pages/AdminLogin';
import AdminRegister from './Pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './Pages/AdminUsers';
import AdminVendors from './Pages/AdminVendors';
import CreateVendor from './pages/admin/CreateVendor';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VendorLogin from './Pages/VendorLogin';
import VendorDashboard from './Pages/VendorDashboard';
import VendorProfile from './Pages/VendorProfile';
import { VendorAuthProvider } from './context/VendorAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

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
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
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
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/*" element={<VendorRoutes />} />
          {/* Admin login/register and admin protected routes */}
          <Route path="/admin/login" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
          <Route path="/admin/register" element={<AdminAuthProvider><AdminRegister /></AdminAuthProvider>} />
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
