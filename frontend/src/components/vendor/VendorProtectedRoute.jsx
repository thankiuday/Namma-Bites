import { useVendorAuth } from '../context/VendorAuthContext';
import { Navigate } from 'react-router-dom';

const VendorProtectedRoute = ({ children }) => {
  const { vendor, loading } = useVendorAuth();
  if (loading) return null;
  if (!vendor) return <Navigate to="/vendor/login" replace />;
  return children;
};
export default VendorProtectedRoute; 