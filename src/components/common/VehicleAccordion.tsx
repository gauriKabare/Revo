import React, { useState } from 'react';
import { Vehicle } from '../../types';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import RentModal from './RentModal';
import './VehicleAccordion.scss';

interface VehicleAccordionProps {
  vehicles: Vehicle[];
  showRentButton?: boolean;
  showMakeAvailableButton?: boolean;
  sortBy?: 'rentDate' | 'createdDate';
}

const VehicleAccordion: React.FC<VehicleAccordionProps> = ({ 
  vehicles, 
  showRentButton = false,
  showMakeAvailableButton = false,
  sortBy = 'createdDate'
}) => {
  const { refreshProducts } = useAuth();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showRentModal, setShowRentModal] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  const toggleAccordion = (vehicleId: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(vehicleId)) {
      newExpanded.delete(vehicleId);
    } else {
      newExpanded.add(vehicleId);
    }
    setExpandedIds(newExpanded);
  };

  const handleMakeAvailable = async (vehicleId: string) => {
    setActionLoading(vehicleId);
    setMessage('');

    try {
      const response = await authAPI.makeAvailable(vehicleId);
      
      if (response.status === 'success') {
        setMessage('Vehicle marked as available successfully!');
        setMessageType('success');
        await refreshProducts();
        
        // Auto-hide message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(response.message || 'Failed to make vehicle available');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
    
    setActionLoading(null);
  };

  const sortVehicles = (vehicles: Vehicle[]) => {
    return [...vehicles].sort((a, b) => {
      if (sortBy === 'rentDate' && a.rentalInfo && b.rentalInfo) {
        return new Date(a.rentalInfo.fromDate).getTime() - new Date(b.rentalInfo.fromDate).getTime();
      } else {
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      }
    });
  };

  const calculateTotalDue = (vehicle: Vehicle) => {
    if (!vehicle.rentalInfo) return 0;
    
    const fromDate = new Date(vehicle.rentalInfo.fromDate);
    const toDate = new Date(vehicle.rentalInfo.toDate);
    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
    const totalAmount = days * vehicle.rate;
    const totalPaid = vehicle.rentalInfo.totalPaid || 0;
    
    return Math.max(0, totalAmount - totalPaid);
  };

  const isLate = (vehicle: Vehicle) => {
    if (!vehicle.rentalInfo) return false;
    const toDate = new Date(vehicle.rentalInfo.toDate);
    const today = new Date();
    return today > toDate;
  };

  const getLateDays = (vehicle: Vehicle) => {
    if (!vehicle.rentalInfo) return 0;
    const toDate = new Date(vehicle.rentalInfo.toDate);
    const today = new Date();
    const diffTime = today.getTime() - toDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const sortedVehicles = sortVehicles(vehicles);

  if (vehicles.length === 0) {
    return (
      <div className="vehicle-accordion-empty">
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <h3>No vehicles found</h3>
          <p>There are no vehicles to display at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-accordion">
      {message && (
        <div className={`message ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
          {message}
        </div>
      )}

      <div className="accordion-list">
        {sortedVehicles.map((vehicle) => (
          <div key={vehicle.id} className="accordion-item">
            <div 
              className="accordion-header"
              onClick={() => toggleAccordion(vehicle.id)}
            >
              <div className="vehicle-summary">
                <img
                  src={vehicle.photos[0]}
                  alt={vehicle.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/60x45?text=No+Image';
                  }}
                />
                <div className="vehicle-basic-info">
                  <h4>{vehicle.name}</h4>
                  <p>{vehicle.model} • {vehicle.type.toUpperCase()}</p>
                  <div className="status-info">
                    <span className={`status-badge ${vehicle.status}`}>
                      {vehicle.status === 'available' ? 'Available' : 'On Rent'}
                    </span>
                    {vehicle.status === 'rented' && isLate(vehicle) && (
                      <span className="late-badge">
                        {getLateDays(vehicle)} days late
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="accordion-toggle">
                <span className={`toggle-icon ${expandedIds.has(vehicle.id) ? 'expanded' : ''}`}>
                  ▼
                </span>
              </div>
            </div>

            {expandedIds.has(vehicle.id) && (
              <div className="accordion-content">
                <div className="vehicle-details">
                  <div className="detail-section">
                    <h5>Vehicle Information</h5>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Rate:</span>
                        <span className="value">₹{vehicle.rate}/day</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Year:</span>
                        <span className="value">{vehicle.manufacturingYear}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Added:</span>
                        <span className="value">
                          {new Date(vehicle.createdDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {vehicle.status === 'rented' && vehicle.rentalInfo && (
                    <div className="detail-section rental-section">
                      <h5>Rental Information</h5>
                      {isLate(vehicle) && (
                        <div className="late-warning">
                          ⚠️ Vehicle is {getLateDays(vehicle)} day(s) overdue!
                        </div>
                      )}
                      
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="label">Customer:</span>
                          <span className="value">{vehicle.rentalInfo.customerName}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Contact:</span>
                          <span className="value">{vehicle.rentalInfo.customerNumber}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">From Date:</span>
                          <span className="value">
                            {new Date(vehicle.rentalInfo.fromDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="label">To Date:</span>
                          <span className="value">
                            {new Date(vehicle.rentalInfo.toDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Total Due:</span>
                          <span className="value due-amount">₹{calculateTotalDue(vehicle)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="action-section">
                    {showRentButton && vehicle.status === 'available' && (
                      <button
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRentModal(vehicle.id);
                        }}
                      >
                        Rent Now
                      </button>
                    )}

                    {showMakeAvailableButton && vehicle.status === 'rented' && (
                      <button
                        className="btn btn-success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMakeAvailable(vehicle.id);
                        }}
                        disabled={actionLoading === vehicle.id}
                      >
                        {actionLoading === vehicle.id ? 'Processing...' : 'Make Available'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rent Modal */}
      {showRentModal && (
        <RentModal
          vehicle={vehicles.find(v => v.id === showRentModal)!}
          onClose={() => setShowRentModal(null)}
        />
      )}
    </div>
  );
};

export default VehicleAccordion; 