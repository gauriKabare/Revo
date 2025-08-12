import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import { authAPI } from '../../services/api';
import './EditProfileModal.scss';

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

interface EditProfileFormData {
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  profilePhoto?: File | null;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<EditProfileFormData>({
    email: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    profilePhoto: null
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when user changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        mobileNumber: user.mobileNumber || '',
        profilePhoto: null
      });
      setPreviewImage(''); // Reset preview image
      setMessage(''); // Clear any messages
    } else if (!isOpen) {
      // Reset form when modal closes
      setPreviewImage('');
      setMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [user, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message) setMessage('');
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file');
        setMessageType('error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size should be less than 5MB');
        setMessageType('error');
        return;
      }

      setFormData(prev => ({ ...prev, profilePhoto: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    // Mobile number validation
    const mobileRegex = /^[0-9]{10}$/;
    if (formData.mobileNumber && !mobileRegex.test(formData.mobileNumber)) {
      setMessage('Please enter a valid 10-digit mobile number');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Convert profile photo to base64 if provided
      let profilePhotoBase64 = '';
      if (formData.profilePhoto) {
        profilePhotoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(formData.profilePhoto!);
        });
      }

      const submitData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileNumber: formData.mobileNumber,
        ...(profilePhotoBase64 && { profilePhoto: profilePhotoBase64 })
      };

      const response = await authAPI.updateProfile(submitData);
      
      if (response.status === 'success') {
        // Use the updated user data returned from the API
        const updatedUser: User = response.data || {
          ...user,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          mobileNumber: formData.mobileNumber
        };
        
        onUpdate(updatedUser);
        setMessage('Profile updated successfully!');
        setMessageType('success');
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage(response.message || 'Failed to update profile');
        setMessageType('error');
      }

    } catch (error) {
      console.error('Update profile error:', error);
      setMessage('An error occurred while updating profile');
      setMessageType('error');
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, profilePhoto: null }));
    setPreviewImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {/* Profile Photo Section */}
          <div className="photo-section">
            <label>Profile Photo</label>
            <div className="photo-upload-area">
              <div className="current-photo">
                <img
                  src={previewImage || user.profilePhoto || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yMCA4MEM0MCA2MCA2MCA2MCA4MCA4MEgyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'}
                  alt="Profile"
                />
                {previewImage && (
                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={removePhoto}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <div className="upload-controls">
                <button
                  type="button"
                  className="btn btn-outline upload-btn"
                  onClick={triggerFileInput}
                >
                  📷 Choose Photo
                </button>
                <p className="upload-hint">Max 5MB • JPG, PNG, GIF</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden-file-input"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={user.username}
              className="form-control"
              disabled
              readOnly
            />
            <small className="field-hint">Username cannot be changed</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal; 