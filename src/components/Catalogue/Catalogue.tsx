import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Vehicle } from '../../types';
import VehicleCard from '../common/VehicleCard';
import './Catalogue.scss';

const Catalogue: React.FC = () => {
  const { products } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'bikes' | 'cars'>('all');

  if (!products) {
    return (
      <div className="catalogue">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading vehicles...</p>
        </div>
      </div>
    );
  }

  const allVehicles: Vehicle[] = [...products.bikes, ...products.cars];
  console.log('Catalogue - All vehicles:', allVehicles.length);
  console.log('Catalogue - Bikes:', products.bikes.length, 'Cars:', products.cars.length);
  
  const getFilteredVehicles = (): Vehicle[] => {
    switch (activeTab) {
      case 'bikes':
        return products.bikes;
      case 'cars':
        return products.cars;
      default:
        return allVehicles;
    }
  };

  const filteredVehicles = getFilteredVehicles();

  return (
    <div className="catalogue">
      <div className="catalogue-header">
        <h2>Vehicle Catalogue</h2>
        <p>Browse through our collection of bikes and cars</p>
      </div>

      {/* Category Stats */}
      <div className="category-stats">
        <div className="stat-item">
          <span className="stat-number">{allVehicles.length}</span>
          <span className="stat-label">Total Vehicles</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{products.bikes.length}</span>
          <span className="stat-label">Bikes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{products.cars.length}</span>
          <span className="stat-label">Cars</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {allVehicles.filter(v => v.status === 'available').length}
          </span>
          <span className="stat-label">Available</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span className="tab-icon">🚗</span>
          All Vehicles ({allVehicles.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'bikes' ? 'active' : ''}`}
          onClick={() => setActiveTab('bikes')}
        >
          <span className="tab-icon">🏍️</span>
          Bikes ({products.bikes.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'cars' ? 'active' : ''}`}
          onClick={() => setActiveTab('cars')}
        >
          <span className="tab-icon">🚙</span>
          Cars ({products.cars.length})
        </button>
      </div>

      {/* Vehicles Grid */}
      <div className="vehicles-grid">
        {filteredVehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No vehicles found</h3>
            <p>There are no vehicles in this category yet.</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              showRentButton={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Catalogue; 