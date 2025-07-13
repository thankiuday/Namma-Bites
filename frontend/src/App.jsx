import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import './App.css'
import Navbar from './components/user/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { VendorAuthProvider } from './context/VendorAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import VendorDetails from './Pages/VendorDetails';

// Animated Route Components
import AnimatedRoutes from './components/AnimatedRoutes';
import AnimatedAdminRoutes from './components/AnimatedAdminRoutes';
import AnimatedVendorRoutes from './components/AnimatedVendorRoutes';
import ScrollToTop from './components/ScrollToTop';

// Group Vendor routes to be wrapped by its provider
const VendorRoutes = () => (
  <VendorAuthProvider>
    <AnimatedVendorRoutes />
  </VendorAuthProvider>
);

// Group Admin routes to be wrapped by its provider
const AdminRoutes = () => (
  <AdminAuthProvider>
    <AnimatedAdminRoutes />
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
        <AnimatedRoutes />
        <Routes>
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
      <ScrollToTop />
      <Routes>
        {/* Vendor and Admin routes (do NOT wrap with AuthProvider) */}
        <Route path="/vendor/*" element={<VendorRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        {/* User and public routes (with AuthProvider) */}
        <Route
          path="/*"
          element={
            <AuthProvider>
              <CartProvider>
                <AppContent />
              </CartProvider>
            </AuthProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
