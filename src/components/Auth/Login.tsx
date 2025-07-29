import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { CreateAccountData } from '../../types';
import './Login.scss';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  
  // Create account form state
  const [createForm, setCreateForm] = useState<CreateAccountData>({
    email: '',
    mobileNumber: '',
    username: '',
    password: '',
    retypePassword: ''
  });
  
  const { login } = useAuth();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!loginForm.username || !loginForm.password) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const success = await login(loginForm.username, loginForm.password);
    
    if (!success) {
      setMessage('Invalid username or password. Please try again or create an account.');
      setMessageType('error');
    }
    
    setLoading(false);
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (!createForm.email || !createForm.mobileNumber || !createForm.username || !createForm.password || !createForm.retypePassword) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (createForm.password !== createForm.retypePassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (createForm.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createForm.email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // Mobile number validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(createForm.mobileNumber)) {
      setMessage('Please enter a valid 10-digit mobile number');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.createUser(createForm);
      
      if (response.status === 'success') {
        setMessage('Account created successfully! Please login with your credentials.');
        setMessageType('success');
        setIsLogin(true);
        setCreateForm({
          email: '',
          mobileNumber: '',
          username: '',
          password: '',
          retypePassword: ''
        });
      } else {
        setMessage(response.message || 'Failed to create account. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
    
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, form: 'login' | 'create') => {
    const { name, value } = e.target;
    
    if (form === 'login') {
      setLoginForm(prev => ({ ...prev, [name]: value }));
    } else {
      setCreateForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear message when user starts typing
    if (message) setMessage('');
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Vehicle Rental Management</h1>
            <p className="login-subtitle">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          {message && (
            <div className={`message ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
              {message}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={loginForm.username}
                  onChange={(e) => handleInputChange(e, 'login')}
                  className="form-control"
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginForm.password}
                  onChange={(e) => handleInputChange(e, 'login')}
                  className="form-control"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="login-links">
                <a href="#" className="forgot-password">Forgot Password?</a>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateAccountSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={createForm.email}
                  onChange={(e) => handleInputChange(e, 'create')}
                  className="form-control"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobileNumber">Mobile Number</label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={createForm.mobileNumber}
                  onChange={(e) => handleInputChange(e, 'create')}
                  className="form-control"
                  placeholder="Enter your mobile number"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="createUsername">Username</label>
                <input
                  type="text"
                  id="createUsername"
                  name="username"
                  value={createForm.username}
                  onChange={(e) => handleInputChange(e, 'create')}
                  className="form-control"
                  placeholder="Choose a username"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="createPassword">Password</label>
                <input
                  type="password"
                  id="createPassword"
                  name="password"
                  value={createForm.password}
                  onChange={(e) => handleInputChange(e, 'create')}
                  className="form-control"
                  placeholder="Create a password"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="retypePassword">Retype Password</label>
                <input
                  type="password"
                  id="retypePassword"
                  name="retypePassword"
                  value={createForm.retypePassword}
                  onChange={(e) => handleInputChange(e, 'create')}
                  className="form-control"
                  placeholder="Retype your password"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="login-footer">
            <p>
              {isLogin ? "New user? " : "Already have an account? "}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                }}
                disabled={loading}
              >
                {isLogin ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 