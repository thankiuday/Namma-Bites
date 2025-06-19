import { useAdminAuth } from '../context/AdminAuthContext';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) return null;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
};
export default AdminProtectedRoute; 