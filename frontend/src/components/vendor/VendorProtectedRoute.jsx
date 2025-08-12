import { useVendorAuth } from '../../context/VendorAuthContext';
import { Navigate } from 'react-router-dom';

const VendorProtectedRoute = ({ children }) => {
  const { vendor, loading } = useVendorAuth();
  if (loading) {
    // Prevent flicker/redirect bounce by not rendering anything until auth is resolved
    return <div className="min-h-screen bg-white" />;
  }
  if (!vendor) return <Navigate to="/vendor/login" replace />;
  return children;
};
export default VendorProtectedRoute; 