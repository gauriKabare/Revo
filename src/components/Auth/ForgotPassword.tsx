import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { ForgotPasswordPhoneData, ForgotPasswordOTPData, UpdateUserPasswordData } from '../../types';
import RevoLogo from '../common/RevoLogo';
import './ForgotPassword.scss';

type ForgotPasswordStep = 'phone' | 'otp' | 'reset';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('phone');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  
  // Form data for each step
  const [phoneData, setPhoneData] = useState<ForgotPasswordPhoneData>({
    mobileNumber: ''
  });
  
  const [otpData, setOtpData] = useState<ForgotPasswordOTPData>({
    mobileNumber: '',
    otp: ''
  });
  
  const [resetData, setResetData] = useState({
    newPassword: '',
    retypeNewPassword: ''
  });

  // Mock OTP for testing (in production, this would come from SMS service)
  const [mockOTP, setMockOTP] = useState('');

  const generateMockOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setMockOTP(otp);
    return otp;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(phoneData.mobileNumber)) {
      setMessage('Please enter a valid 10-digit mobile number');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // In production, this would verify if the phone number exists in the database
      const response = await authAPI.verifyPhoneNumber(phoneData);
      
      if (response.status === 'success') {
        // Generate mock OTP for testing
        const generatedOTP = generateMockOTP();
        setOtpData(prev => ({ ...prev, mobileNumber: phoneData.mobileNumber }));
        setMessage(`OTP sent to your mobile number. Mock OTP: ${generatedOTP}`);
        setMessageType('success');
        setCurrentStep('otp');
      } else {
        setMessage(response.message || 'Phone number not found. Please check and try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
    
    setLoading(false);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (!otpData.otp || otpData.otp.length !== 6) {
      setMessage('Please enter a valid 6-digit OTP');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // Mock OTP verification
      if (otpData.otp === mockOTP) {
        setMessage('OTP verified successfully!');
        setMessageType('success');
        setCurrentStep('reset');
      } else {
        // In production, you would call the API here
        // const response = await authAPI.verifyOTP(otpData);
        setMessage('Invalid OTP. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
    
    setLoading(false);
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (!resetData.newPassword || !resetData.retypeNewPassword) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (resetData.newPassword !== resetData.retypeNewPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (resetData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const updateData: UpdateUserPasswordData = {
        mobileNumber: phoneData.mobileNumber,
        newPassword: resetData.newPassword
      };

      const response = await authAPI.updateUser(updateData);
      
      if (response.status === 'success') {
        setMessage('Password updated successfully! Redirecting to login...');
        setMessageType('success');
        
        // Navigate back to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(response.message || 'Failed to update password. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
    
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (currentStep === 'phone') {
      setPhoneData(prev => ({ ...prev, [name]: value }));
    } else if (currentStep === 'otp') {
      setOtpData(prev => ({ ...prev, [name]: value }));
    } else if (currentStep === 'reset') {
      setResetData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear message when user starts typing
    if (message) setMessage('');
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'phone':
        return 'Reset Your Password';
      case 'otp':
        return 'Verify OTP';
      case 'reset':
        return 'Create New Password';
      default:
        return 'Forgot Password';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'phone':
        return 'Enter your registered mobile number';
      case 'otp':
        return 'Enter the OTP sent to your mobile';
      case 'reset':
        return 'Create a strong new password';
      default:
        return '';
    }
  };

  const renderPhoneStep = () => (
    <form onSubmit={handlePhoneSubmit} className="forgot-password-form">
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
            value={phoneData.mobileNumber}
            onChange={handleInputChange}
            className="form-control"
            placeholder="Enter your registered mobile number"
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
          {loading ? 'Verifying...' : 'Generate OTP'}
        </span>
        <div className="btn-glow"></div>
      </button>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleOTPSubmit} className="forgot-password-form">
      <div className="phone-display">
        <span>OTP sent to: </span>
        <strong>{phoneData.mobileNumber}</strong>
        <button
          type="button"
          className="change-number-btn"
          onClick={() => setCurrentStep('phone')}
          disabled={loading}
        >
          Change
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="otp">
          <span className="label-text">Enter OTP</span>
          <span className="label-icon">🔐</span>
        </label>
        <div className="input-wrapper">
          <input
            type="text"
            id="otp"
            name="otp"
            value={otpData.otp}
            onChange={handleInputChange}
            className="form-control otp-input"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
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
          {loading ? 'Verifying...' : 'Verify OTP'}
        </span>
        <div className="btn-glow"></div>
      </button>

      <div className="resend-section">
        <p>Didn't receive OTP?</p>
        <button
          type="button"
          className="link-button"
          onClick={() => handlePhoneSubmit({ preventDefault: () => {} } as React.FormEvent)}
          disabled={loading}
        >
          <span>Resend OTP</span>
          <div className="link-underline"></div>
        </button>
      </div>
    </form>
  );

  const renderResetStep = () => (
    <form onSubmit={handlePasswordResetSubmit} className="forgot-password-form">
      <div className="form-group">
        <label htmlFor="newPassword">
          <span className="label-text">New Password</span>
          <span className="label-icon">🔒</span>
        </label>
        <div className="input-wrapper">
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={resetData.newPassword}
            onChange={handleInputChange}
            className="form-control"
            placeholder="Enter new password"
            disabled={loading}
          />
          <div className="input-highlight"></div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="retypeNewPassword">
          <span className="label-text">Confirm Password</span>
          <span className="label-icon">🔐</span>
        </label>
        <div className="input-wrapper">
          <input
            type="password"
            id="retypeNewPassword"
            name="retypeNewPassword"
            value={resetData.retypeNewPassword}
            onChange={handleInputChange}
            className="form-control"
            placeholder="Confirm new password"
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
          {loading ? 'Updating Password...' : 'Change Password'}
        </span>
        <div className="btn-glow"></div>
      </button>
    </form>
  );

  return (
    <div className="forgot-password-container">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>

      <div className="forgot-password-wrapper">
        <div className="forgot-password-card">
          {/* Header */}
          <div className="forgot-password-header">
            <RevoLogo size="lg" animated={true} />
            <div className="header-divider"></div>
            <h2 className="step-title">{getStepTitle()}</h2>
            <p className="step-subtitle">{getStepSubtitle()}</p>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps">
            <div className={`step ${currentStep === 'phone' ? 'active' : currentStep === 'otp' || currentStep === 'reset' ? 'completed' : ''}`}>
              <div className="step-circle">1</div>
              <span>Phone</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep === 'otp' ? 'active' : currentStep === 'reset' ? 'completed' : ''}`}>
              <div className="step-circle">2</div>
              <span>OTP</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep === 'reset' ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <span>Reset</span>
            </div>
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

          {/* Form Content */}
          <div className="form-container">
            {currentStep === 'phone' && renderPhoneStep()}
            {currentStep === 'otp' && renderOTPStep()}
            {currentStep === 'reset' && renderResetStep()}
          </div>

          {/* Footer */}
          <div className="forgot-password-footer">
            <div className="footer-divider"></div>
            <p>
              Remember your password?{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                <span>Back to Login</span>
                <div className="link-underline"></div>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 