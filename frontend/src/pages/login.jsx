import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { USER_API_END_POINT } from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';
import '../styles/font.css';
import { useAuth } from '../context/AuthContext';
import BlockedPage from '../pages/BlockedPage';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBlockedUser, setIsBlockedUser] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${USER_API_END_POINT}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response:", data); // helpful debug

      // ✅ Blocked user handling (either based on status code or returned isBlocked flag)
      if (
        response.status === 403 ||
        data?.user?.isBlocked === true
      ) {
        toast.error(data.message || 'Your account has been blocked.');
        setTimeout(() => setIsBlockedUser(true), 300);
        return;
      }

      if (response.ok) {
        toast.success(`Welcome back, ${data.user.username}!`);
        localStorage.setItem('token', data.token);
        login(data.user);

        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show BlockedPage component if blocked
  if (isBlockedUser) return <BlockedPage />;

  return (
    <div className="container">
      <div className="corner top-left" />
      <div className="corner bottom-right" />
      <div className="login-card">
        <Toaster position="top-right" reverseOrder={false} />
        <div className="login-content">
          <h2>Excel Analytics Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="email">Email</label>
            </div>

            <div className="input-group">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password">Password</label>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="register-link">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
