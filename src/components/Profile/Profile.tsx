import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { OwnerResponse, User } from '../../types';
import EditProfileModal from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';
import './Profile.scss';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState<OwnerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await authAPI.getOwner(user.username);
        
        if (response.status === 'success') {
          setProfileData(response?.data || null);
        } else {
          setError(response?.message || 'Failed to load profile data');
        }
      } catch (err) {
        setError('An error occurred while loading profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleProfileUpdate = async (updatedUser: User) => {
    // Update user in AuthContext
    updateUser(updatedUser);
    
    // Refetch profile data to get latest info
    try {
      const response = await authAPI.getOwner(updatedUser.username);
      if (response.status === 'success') {
        setProfileData(response?.data || null);
      }
    } catch (error) {
      console.error('Error refreshing profile data:', error);
    }
    
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handlePasswordChangeSuccess = () => {
    setSuccessMessage('Password changed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="profile">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Error Loading Profile</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const displayProfilePhoto = profileData?.profilePhoto || '/default-avatar.png';

  return (
    <div className="profile">
      <div className="profile-container">
        <div className="profile-header">
          <h2>My Profile</h2>
          <p>Manage your account information</p>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <img
                  src={displayProfilePhoto}
                  alt="Profile"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yMCA4MEM0MCA2MCA2MCA2MCA4MCA4MEgyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                  }}
                />
              </div>
              <div className="avatar-info">
                <h3>
                  {(profileData?.firstName && profileData?.lastName) 
                    ? `${profileData.firstName} ${profileData.lastName}`
                    : (user?.firstName && user?.lastName) 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.username}
                </h3>
                <p>Vehicle Rental Owner</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-group">
                <label>Username</label>
                <div className="detail-value">
                  <span className="detail-icon">👤</span>
                  <span>{profileData?.username || user?.username}</span>
                </div>
              </div>

              <div className="detail-group">
                <label>Email Address</label>
                <div className="detail-value">
                  <span className="detail-icon">📧</span>
                  <span>{profileData?.email || 'Not provided'}</span>
                </div>
              </div>

              <div className="detail-group">
                <label>Contact Number</label>
                <div className="detail-value">
                  <span className="detail-icon">📱</span>
                  <span>{profileData?.contactNumber || 'Not provided'}</span>
                </div>
              </div>

              <div className="detail-group">
                <label>Member Since</label>
                <div className="detail-value">
                  <span className="detail-icon">📅</span>
                  <span>January 2024</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
          </div>

          {/* Account Stats */}
          <div className="profile-stats">
            <h3>Account Activity</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon">🚗</div>
                <div className="stat-info">
                  <div className="stat-number">-</div>
                  <div className="stat-label">Total Vehicles</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <div className="stat-number">-</div>
                  <div className="stat-label">Active Rentals</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <div className="stat-number">-</div>
                  <div className="stat-label">Monthly Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-notification">
            <span className="success-icon">✓</span>
            {successMessage}
          </div>
        )}
      </div>

      {/* Modals */}
      {user && (
        <EditProfileModal
          user={{
            ...user,
            // Override with more complete data from profileData if available
            ...(profileData && {
              email: profileData.email,
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              mobileNumber: profileData.contactNumber
            })
          }}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
      
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
};

export default Profile; 