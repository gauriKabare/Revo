import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import VehicleAccordion from '../common/VehicleAccordion';
import './VehiclesAvailable.scss';

const VehiclesAvailable: React.FC = () => {
  const { sessionData } = useAuth();

  const availableVehicles = useMemo(() => {
    if (!sessionData) return [];
    
    const allVehicles = [...sessionData.products.bikes, ...sessionData.products.cars];
    return allVehicles.filter(vehicle => vehicle.status === 'available' && !vehicle.isRentedFlag);
  }, [sessionData]);

  const calculateStats = () => {
    const totalAvailable = availableVehicles.length;
    const totalVehicles = sessionData ? 
      sessionData.products.bikes.length + sessionData.products.cars.length : 0;
    const availableBikes = availableVehicles.filter(v => v.type === 'bike').length;
    const availableCars = availableVehicles.filter(v => v.type === 'car').length;
    
    const averageRate = availableVehicles.length > 0 ? 
      availableVehicles.reduce((sum, v) => sum + v.rate, 0) / availableVehicles.length : 0;

    return { 
      totalAvailable, 
      totalVehicles, 
      availableBikes, 
      availableCars, 
      averageRate,
      availabilityRate: totalVehicles > 0 ? Math.round((totalAvailable / totalVehicles) * 100) : 0
    };
  };

  const stats = calculateStats();

  return (
    <div className="vehicles-available">
      <div className="page-header">
        <h1>Available Vehicles</h1>
        <p>Browse and manage all available vehicles for rental</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">🚙</div>
          <div className="stat-content">
            <h3>{stats.totalAvailable}</h3>
            <p>Available Now</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏍️</div>
          <div className="stat-content">
            <h3>{stats.availableBikes}</h3>
            <p>Bikes Available</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>{stats.availableCars}</h3>
            <p>Cars Available</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <h3>₹{Math.round(stats.averageRate)}</h3>
            <p>Average Rate/Day</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-section">
        <div className="filter-tabs">
          <button className="filter-tab active">
            All ({stats.totalAvailable})
          </button>
          <button className="filter-tab">
            Bikes ({stats.availableBikes})
          </button>
          <button className="filter-tab">
            Cars ({stats.availableCars})
          </button>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="vehicles-section">
        <div className="section-header">
          <h2>Available Vehicles</h2>
          <p>Sorted by date added (ascending) • Click to expand details</p>
        </div>

        {availableVehicles.length > 0 ? (
          <VehicleAccordion
            vehicles={availableVehicles}
            showRentButton={true}
            sortBy="createdDate"
          />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Available Vehicles</h3>
            <p>All vehicles are currently rented out. Add new vehicles or wait for returns to see available options.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {availableVehicles.length > 0 && (
        <div className="quick-actions">
          <div className="action-card">
            <div className="action-content">
              <h4>Ready for Business</h4>
              <p>You have {stats.totalAvailable} vehicles ready to rent. Great availability rate of {stats.availabilityRate}%!</p>
            </div>
            <div className="action-icon">✅</div>
          </div>
        </div>
      )}

      {/* Availability Insights */}
      <div className="insights-section">
        <h3>Fleet Insights</h3>
        <div className="insights-grid">
          <div className="insight-item">
            <div className="insight-label">Total Fleet Size</div>
            <div className="insight-value">{stats.totalVehicles} vehicles</div>
          </div>
          <div className="insight-item">
            <div className="insight-label">Availability Rate</div>
            <div className="insight-value">{stats.availabilityRate}%</div>
          </div>
          <div className="insight-item">
            <div className="insight-label">Revenue Potential</div>
            <div className="insight-value">₹{(stats.totalAvailable * stats.averageRate).toLocaleString()}/day</div>
          </div>
          <div className="insight-item">
            <div className="insight-label">Fleet Mix</div>
            <div className="insight-value">
              {stats.availableBikes}B / {stats.availableCars}C
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclesAvailable; 