import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import './ChangePasswordModal.scss';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  otp: string;
}

type PasswordStep = 'password' | 'otp';

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<PasswordStep>('password');
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [mockOTP, setMockOTP] = useState('');

  const generateMockOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message) setMessage('');
  };

  const validatePasswords = (): boolean => {
    if (!formData.currentPassword.trim()) {
      setMessage('Please enter your current password');
      setMessageType('error');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long');
      setMessageType('error');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage('New password must be different from current password');
      setMessageType('error');
      return false;
    }

    return true;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await authAPI.changePasswordStep1({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.status === 'success') {
        // Generate mock OTP and proceed to OTP step
        const generatedOTP = generateMockOTP();
        setMockOTP(generatedOTP);
        setMessage(`OTP sent to your registered mobile number. For testing, use: ${generatedOTP}`);
        setMessageType('success');
        setCurrentStep('otp');
      } else {
        setMessage(response.message || 'Password validation failed');
        setMessageType('error');
      }
      
    } catch (error) {
      setMessage('Current password is incorrect');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otp || formData.otp.length !== 6) {
      setMessage('Please enter a valid 6-digit OTP');
      setMessageType('error');
      return;
    }

    // Validate mock OTP
    if (formData.otp !== mockOTP) {
      setMessage('Invalid OTP. Please try again.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await authAPI.changePasswordStep2({
        username: 'testuser', // In production, get from context or JWT
        newPassword: formData.newPassword,
        otp: formData.otp
      });
      
      if (response.status === 'success') {
        setMessage('Password changed successfully!');
        setMessageType('success');
        
        setTimeout(() => {
          onSuccess();
          resetForm();
          onClose();
        }, 1500);
      } else {
        setMessage(response.message || 'Failed to change password');
        setMessageType('error');
      }

    } catch (error) {
      setMessage('Failed to change password. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      otp: ''
    });
    setCurrentStep('password');
    setMessage('');
    setMockOTP('');
  };

  const handleBackToPassword = () => {
    setCurrentStep('password');
    setMessage('');
    setFormData(prev => ({ ...prev, otp: '' }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="change-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Change Password</h2>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className={`progress-step ${currentStep === 'password' ? 'active' : 'completed'}`}>
            <div className="step-number">1</div>
            <span>Password</span>
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

        {currentStep === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="change-password-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password *</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter your current password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password *</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter new password (min 6 characters)"
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Re-enter new password"
                minLength={6}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Validating...' : 'Send OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOTPSubmit} className="change-password-form">
            <div className="otp-info">
              <div className="otp-icon">📱</div>
              <h3>Enter Verification Code</h3>
              <p>We've sent a 6-digit code to your registered mobile number</p>
            </div>

            <div className="form-group">
              <label htmlFor="otp">Enter OTP *</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className="form-control otp-input"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleBackToPassword}
                className="btn btn-outline"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal; 