import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { USER_ROLES, hasPermission } from '../../constants';

const ProtectedRoute = ({
  children,
  requiredRole = null,
  requiredPermission = null,
  allowGuest = false
}) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // If route allows guest access and user is not authenticated, allow access
  if (allowGuest && !isAuthenticated) {
    return children;
  }

  // If user is not authenticated and route doesn't allow guest access
  if (!isAuthenticated && !allowGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated, check role and permissions
  if (isAuthenticated && user) {
    // Check if user account is approved (except for guest)
    if (user.role !== USER_ROLES.GUEST && !user.is_approved) {
      return <Navigate to="/pending-approval" replace />;
    }

    // Check required role
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }

    // Check required permission
    if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
