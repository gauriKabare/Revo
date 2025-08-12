import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminLoginData } from '../../types';
import RevoLogo from '../common/RevoLogo';
import './AdminLogin.scss';

type AdminLoginStep = 'credentials' | 'otp';

const AdminLogin: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AdminLoginStep>('credentials');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [mockOTP, setMockOTP] = useState('');
  
  const [adminData, setAdminData] = useState<AdminLoginData>({
    username: '',
    password: '',
    otp: ''
  });

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const generateMockOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminData.username.trim() || !adminData.password.trim()) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await adminLogin({
        username: adminData.username,
        password: adminData.password
      });

      if (result.success && result.requiresOTP) {
        const generatedOTP = generateMockOTP();
        setMockOTP(generatedOTP);
        setMessage(`OTP sent to registered mobile number. For testing, use: ${generatedOTP}`);
        setMessageType('success');
        setCurrentStep('otp');
      } else {
        setMessage('Invalid admin credentials');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Login failed. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminData.otp || adminData.otp.length !== 6) {
      setMessage('Please enter a valid 6-digit OTP');
      setMessageType('error');
      return;
    }

    // Validate mock OTP
    if (adminData.otp !== mockOTP) {
      setMessage('Invalid OTP. Please try again.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await adminLogin({
        username: adminData.username,
        password: adminData.password,
        otp: adminData.otp
      });

      if (result.success) {
        setMessage('Admin login successful!');
        setMessageType('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setMessage('OTP verification failed');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Verification failed. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToUser = () => {
    navigate('/login');
  };

  const handleBackToCredentials = () => {
    setCurrentStep('credentials');
    setMessage('');
    setAdminData(prev => ({ ...prev, otp: '' }));
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <RevoLogo />
          <div className="welcome-text">
            <h1>Welcome - Admin</h1>
            <p>Please log in to your account</p>
          </div>
          
          <button 
            className="back-to-user-btn"
            onClick={handleBackToUser}
            type="button"
          >
            ← Back to User Login
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className={`progress-step ${currentStep === 'credentials' ? 'active' : 'completed'}`}>
            <div className="step-number">1</div>
            <span>Credentials</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep === 'otp' ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>OTP Verification</span>
          </div>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        {currentStep === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={adminData.username}
                onChange={(e) => setAdminData(prev => ({ ...prev, username: e.target.value }))}
                className="form-control"
                placeholder="Enter admin username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={adminData.password}
                onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                className="form-control"
                placeholder="Enter admin password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-login"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Generate OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTPSubmit} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={adminData.otp}
                onChange={(e) => setAdminData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                className="form-control otp-input"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleBackToCredentials}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-login"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Login as Admin'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin; 