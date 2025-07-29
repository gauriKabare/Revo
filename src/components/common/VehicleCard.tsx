import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Vehicle } from '../../types';
import RentModal from './RentModal';
import './VehicleCard.scss';

interface VehicleCardProps {
  vehicle: Vehicle;
  showRentButton?: boolean;
  compact?: boolean;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ 
  vehicle, 
  showRentButton = true, 
  compact = false 
}) => {
  const [showRentModal, setShowRentModal] = useState(false);

  const getStatusBadge = () => {
    if (vehicle.status === 'available') {
      return <span className="status-badge status-available">Available</span>;
    } else {
      return <span className="status-badge status-rented">On Rent</span>;
    }
  };

  const getLatestAvailabilityDate = () => {
    if (vehicle.isRentedFlag && vehicle.rentalInfo) {
      return new Date(vehicle.rentalInfo.toDate).toLocaleDateString();
    }
    return 'Available Now';
  };

  const handleRentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (vehicle.status === 'available') {
      setShowRentModal(true);
    }
  };

  return (
    <>
      <Link 
        to={`/catalogue/${vehicle.type}/${vehicle.id}`} 
        className={`vehicle-card ${compact ? 'compact' : ''}`}
      >
        <div className="vehicle-image">
          <img
            src={vehicle.photos[0]}
            alt={vehicle.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/400x250?text=Vehicle+Image';
            }}
          />
          <div className="image-overlay">
            {getStatusBadge()}
            <span className="vehicle-type">{vehicle.type.toUpperCase()}</span>
          </div>
        </div>

        <div className="vehicle-info">
          <div className="vehicle-header">
            <h3 className="vehicle-name">{vehicle.name}</h3>
            <div className="vehicle-rate">₹{vehicle.rate}/day</div>
          </div>

          <p className="vehicle-model">{vehicle.model}</p>

          <div className="vehicle-details">
            <div className="detail-item">
              <span className="detail-label">Year:</span>
              <span className="detail-value">{vehicle.manufacturingYear}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Available:</span>
              <span className="detail-value">{getLatestAvailabilityDate()}</span>
            </div>
          </div>

          {showRentButton && vehicle.status === 'available' && (
            <button
              className="rent-button btn btn-primary"
              onClick={handleRentClick}
            >
              Rent Now
            </button>
          )}

          {vehicle.status === 'rented' && vehicle.rentalInfo && (
            <div className="rental-info">
              <p className="rented-to">Rented to: {vehicle.rentalInfo.customerName}</p>
              <p className="rental-period">
                Until: {new Date(vehicle.rentalInfo.toDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </Link>

      {showRentModal && (
        <RentModal
          vehicle={vehicle}
          onClose={() => setShowRentModal(false)}
        />
      )}
    </>
  );
};

export default VehicleCard; 