// src/components/PrivateRoute.jsx
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Main PrivateRoute component
export const PrivateRoute = ({ 
  roles = [], 
  requireApproval = false, 
  emailVerified = false,
  redirectPath = '/login'
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Email verification check
  if (emailVerified && !user.is_email_verified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // Role-based access check
  if (roles.length > 0 && !roles.includes(user.role)) {
    return user.role === 'STUDENT' 
      ? <Navigate to="/profile" replace />
      : <Navigate to="/unauthorized" replace />;
  }

  // Educator approval check
  if (requireApproval && user.role === 'EDUCATOR' && !user.is_approved) {
    return <Navigate to="/educator/pending-approval" replace />;
  }

  return <Outlet />;
};

// Specific route guards
export const StudentRoute = () => (
  <PrivateRoute roles={['STUDENT']} />
);

export const EducatorRoute = () => (
  <PrivateRoute roles={['EDUCATOR']} requireApproval />
);

export const AdminRoute = () => (
  <PrivateRoute roles={['ADMIN']} />
);

export const VerifiedEmailRoute = () => (
  <PrivateRoute emailVerified />
);

// Combined role route (example)
export const EducatorOrAdminRoute = () => (
  <PrivateRoute roles={['EDUCATOR', 'ADMIN']} />
);