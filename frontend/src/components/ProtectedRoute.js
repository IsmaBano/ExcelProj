import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');

  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.user?.role || decoded.role;

    if (requiredRole && userRole !== requiredRole) {
      // Redirect user if role doesn't match
      return <Navigate to="/" />; // or you can redirect to unauthorized page
    }

    return children;
  } catch (error) {
    console.error("Invalid token", error);
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
