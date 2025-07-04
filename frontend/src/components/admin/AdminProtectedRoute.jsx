import { useAdminAuth } from '/src/context/AdminAuthContext.jsx';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  console.log("[AdminProtectedRoute] loading =", loading, "admin =", admin);
  if (loading) return null;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
};
export default AdminProtectedRoute; 