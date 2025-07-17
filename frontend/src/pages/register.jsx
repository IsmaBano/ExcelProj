import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { USER_API_END_POINT } from '../api/api';
import { useNavigate } from 'react-router-dom'; // ✅ Import navigate
import '../styles/Register.css';
import '../styles/font.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const navigate = useNavigate(); // ✅ Initialize navigation

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${USER_API_END_POINT}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${data.message}\nWelcome ${data.user.username}!`);
        localStorage.setItem("token", data.token);
        setTimeout(() => {
          navigate('/login'); // ✅ Redirect after success
        }, 1500);
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="corner top-left" />
      <div className="corner bottom-right" />
      <Toaster position="top-right" reverseOrder={false} />
      <div className="register-card">
        <div className="register-content">
          <h2>Excel Analytics Register</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="register-input-group">  
              <input
                type="text"
                name="username"
                id="register-username"
                placeholder=" "
                value={formData.username}
                onChange={handleChange}
                required
              />
              <label htmlFor="register-username">Username</label>
            </div>

            <div className="register-input-group">
              <input
                type="email"
                name="email"
                id="register-email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label htmlFor="register-email">Email</label>
            </div>

            <div className="register-input-group">
              <select
                name="role"
                id="register-role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <label htmlFor="register-role">Role</label>
            </div>

            <div className="register-input-group">
              <input
                type="password"
                name="password"
                id="register-password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label htmlFor="register-password">Password</label>
            </div>

            <div className="register-input-group">
              <input
                type="password"
                name="confirmPassword"
                id="register-confirmPassword"
                placeholder=" "
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <label htmlFor="register-confirmPassword">Confirm Password</label>
            </div>

            <button type="submit" className="register-btn">Register</button>
          </form>
          <p className="register-link">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
