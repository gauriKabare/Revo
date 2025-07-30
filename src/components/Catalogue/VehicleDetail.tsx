import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vehicle } from '../../types';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import PhotoCarousel from '../common/PhotoCarousel';
import RentModal from '../common/RentModal';
import UpdateRentalModal from '../common/UpdateRentalModal';
import './VehicleDetail.scss';

const VehicleDetail: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { sessionData, refreshProducts } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRentModal, setShowRentModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  useEffect(() => {
    if (sessionData && id) {
      // Find vehicle from session data
      const allVehicles = [...sessionData.products.bikes, ...sessionData.products.cars];
      const foundVehicle = allVehicles.find(v => v.id === id);
      setVehicle(foundVehicle || null);
      setLoading(false);
    }
  }, [sessionData, id]);

  const calculateTotalDue = () => {
    if (!vehicle?.rentalInfo) return 0;
    
    const fromDate = new Date(vehicle.rentalInfo.fromDate);
    const toDate = new Date(vehicle.rentalInfo.toDate);
    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
    const totalAmount = days * vehicle.rate;
    const totalPaid = vehicle.rentalInfo.totalPaid || 0;
    
    return Math.max(0, totalAmount - totalPaid);
  };

  const calculateLateDays = () => {
    if (!vehicle?.rentalInfo) return 0;
    
    const toDate = new Date(vehicle.rentalInfo.toDate);
    const today = new Date();
    const diffTime = today.getTime() - toDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const handleMakeAvailable = async () => {
    if (!vehicle) return;
    
    setActionLoading(true);
    setMessage('');

    try {
      const response = await authAPI.makeAvailable(vehicle.id);
      
      if (response.status === 'success') {
        setMessage('Vehicle marked as available successfully!');
        setMessageType('success');
        await refreshProducts();
        
        // Update local vehicle state
        setVehicle(prev => prev ? {
          ...prev,
          status: 'available',
          availability: 'available',
          isRentedFlag: false,
          rentalInfo: undefined
        } : null);
      } else {
        setMessage(response.message || 'Failed to make vehicle available');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
    
    setActionLoading(false);
  };

  const isLate = () => {
    if (!vehicle?.rentalInfo) return false;
    const toDate = new Date(vehicle.rentalInfo.toDate);
    const today = new Date();
    return today > toDate;
  };

  if (loading) {
    return (
      <div className="vehicle-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading vehicle details...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="vehicle-detail-error">
        <h2>Vehicle Not Found</h2>
        <p>The vehicle you're looking for doesn't exist or has been removed.</p>
        <button className="btn btn-primary" onClick={() => navigate('/catalogue')}>
          Back to Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="vehicle-detail">
      <div className="vehicle-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Vehicle Details</h1>
      </div>

      {message && (
        <div className={`message ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
          {message}
        </div>
      )}

      <div className="vehicle-detail-content">
        {/* Photo Carousel */}
        <div className="vehicle-photos">
          <PhotoCarousel photos={vehicle.photos} altText={vehicle.name} />
        </div>

        {/* Vehicle Information */}
        <div className="vehicle-info">
          <div className="vehicle-basic-info">
            <h2 className="vehicle-name">{vehicle.name}</h2>
            <p className="vehicle-model">{vehicle.model}</p>
            <div className="vehicle-stats">
              <div className="stat-item">
                <span className="stat-label">Status:</span>
                <span className={`stat-value status-${vehicle.status}`}>
                  {vehicle.status === 'available' ? 'Available' : 'On Rent'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Type:</span>
                <span className="stat-value">{vehicle.type.toUpperCase()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Manufacturing Year:</span>
                <span className="stat-value">{vehicle.manufacturingYear}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Rate:</span>
                <span className="stat-value rate">₹{vehicle.rate}/day</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Latest Availability:</span>
                <span className="stat-value">
                  {vehicle.isRentedFlag && vehicle.rentalInfo 
                    ? new Date(vehicle.rentalInfo.toDate).toLocaleDateString()
                    : 'Available Now'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons for Available Vehicle */}
          {vehicle.status === 'available' && (
            <div className="vehicle-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowRentModal(true)}
              >
                Rent Now
              </button>
            </div>
          )}

          {/* Rental Information for Rented Vehicle */}
          {vehicle.status === 'rented' && vehicle.rentalInfo && (
            <div className="rental-info-section">
              <h3>Rental Information</h3>
              {isLate() && (
                <div className="late-warning">
                  ⚠️ Vehicle is {calculateLateDays()} day(s) overdue!
                </div>
              )}
              
              <div className="rental-details">
                <div className="rental-row">
                  <div className="rental-field">
                    <label>Customer Name:</label>
                    <span className="readonly-field">{vehicle.rentalInfo.customerName}</span>
                  </div>
                  <div className="rental-field">
                    <label>Contact Number:</label>
                    <span className="editable-field">{vehicle.rentalInfo.customerNumber}</span>
                  </div>
                </div>
                
                <div className="rental-row">
                  <div className="rental-field">
                    <label>PAN:</label>
                    <span className="readonly-field">{vehicle.rentalInfo.customerPAN}</span>
                  </div>
                  <div className="rental-field">
                    <label>Aadhar:</label>
                    <span className="readonly-field">{vehicle.rentalInfo.customerAadhar}</span>
                  </div>
                </div>
                
                <div className="rental-row">
                  <div className="rental-field">
                    <label>From Date:</label>
                    <span className="readonly-field">
                      {new Date(vehicle.rentalInfo.fromDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="rental-field">
                    <label>To Date:</label>
                    <span className="editable-field">
                      {new Date(vehicle.rentalInfo.toDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="rental-row">
                  <div className="rental-field">
                    <label>Total Paid:</label>
                    <span className="readonly-field">₹{vehicle.rentalInfo.totalPaid || 0}</span>
                  </div>
                  <div className="rental-field">
                    <label>Total Due:</label>
                    <span className="readonly-field due-amount">₹{calculateTotalDue()}</span>
                  </div>
                </div>
              </div>

              <div className="rental-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowUpdateModal(true)}
                  disabled={actionLoading}
                >
                  Edit Rental Info
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleMakeAvailable}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Make Available'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRentModal && (
        <RentModal
          vehicle={vehicle}
          onClose={() => setShowRentModal(false)}
        />
      )}

      {showUpdateModal && vehicle.rentalInfo && (
        <UpdateRentalModal
          vehicle={vehicle}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={(updatedVehicle) => {
            setVehicle(updatedVehicle);
            setShowUpdateModal(false);
            setMessage('Rental information updated successfully!');
            setMessageType('success');
          }}
        />
      )}
    </div>
  );
};

export default VehicleDetail; 