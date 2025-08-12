import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { CreateAccountData } from '../../types';
import RevoLogo from '../common/RevoLogo';
import './Login.scss';

const Login: React.FC = () => {
  const navigate = useNavigate();
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
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-particles">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>

      <div className="login-wrapper">
        <div className="login-card">
          {/* Logo Section */}
          <div className="login-header">
            <button 
              className="admin-login-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Admin button clicked!');
                navigate('/admin-login');
              }}
              type="button"
              title="Admin Login"
              style={{ position: 'relative', zIndex: 999 }}
            >
              <span className="admin-icon">🔐</span>
              <span className="admin-text">Admin</span>
            </button>
            <RevoLogo size="lg" animated={true} />
            <div className="header-divider"></div>
            <p className="login-subtitle">
              {isLogin ? 'Access Your Dashboard' : 'Join The Revolution'}
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`message ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
              <div className="message-icon">
                {messageType === 'success' ? '✓' : '⚠'}
              </div>
              {message}
            </div>
          )}

          {/* Form Section */}
          <div className="form-container">
            {isLogin ? (
              <form onSubmit={handleLoginSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="username">
                    <span className="label-text">Username</span>
                    <span className="label-icon">👤</span>
                  </label>
                  <div className="input-wrapper">
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
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    <span className="label-text">Password</span>
                    <span className="label-icon">🔒</span>
                  </label>
                  <div className="input-wrapper">
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
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-futuristic"
                  disabled={loading}
                >
                  <span className="btn-text">
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </span>
                  <div className="btn-glow"></div>
                </button>

                <div className="login-links">
                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => navigate('/forgot-password')}
                  >
                    <span>Forgot Password?</span>
                    <div className="link-underline"></div>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateAccountSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">
                    <span className="label-text">Email</span>
                    <span className="label-icon">📧</span>
                  </label>
                  <div className="input-wrapper">
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
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="mobileNumber">
                    <span className="label-text">Mobile Number</span>
                    <span className="label-icon">📱</span>
                  </label>
                  <div className="input-wrapper">
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
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="createUsername">
                    <span className="label-text">Username</span>
                    <span className="label-icon">👤</span>
                  </label>
                  <div className="input-wrapper">
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
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="createPassword">
                    <span className="label-text">Password</span>
                    <span className="label-icon">🔒</span>
                  </label>
                  <div className="input-wrapper">
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
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="retypePassword">
                    <span className="label-text">Confirm Password</span>
                    <span className="label-icon">🔐</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="retypePassword"
                      name="retypePassword"
                      value={createForm.retypePassword}
                      onChange={(e) => handleInputChange(e, 'create')}
                      className="form-control"
                      placeholder="Confirm your password"
                      disabled={loading}
                    />
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-futuristic"
                  disabled={loading}
                >
                  <span className="btn-text">
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </span>
                  <div className="btn-glow"></div>
                </button>
              </form>
            )}
          </div>

          {/* Footer Section */}
          <div className="login-footer">
            <div className="footer-divider"></div>
            <p>
              {isLogin ? "New to Revo? " : "Already have an account? "}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                }}
                disabled={loading}
              >
                <span>{isLogin ? 'Create an account' : 'Sign in'}</span>
                <div className="link-underline"></div>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 