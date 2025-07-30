import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import VehicleAccordion from '../common/VehicleAccordion';
import './VehiclesAvailable.scss';

type FilterType = 'all' | 'bikes' | 'cars';

const VehiclesAvailable: React.FC = () => {
  const { sessionData, products } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const availableVehicles = useMemo(() => {
    // Use products first, fallback to sessionData if products not available
    const productData = products || sessionData?.products;
    if (!productData) return [];
    
    const allVehicles = [...productData.bikes, ...productData.cars];
    console.log('All vehicles in VehiclesAvailable:', allVehicles.length);
    const available = allVehicles.filter(vehicle => vehicle.status === 'available' && !vehicle.isRentedFlag);
    console.log('Available vehicles:', available.length);
    return available;
  }, [sessionData, products]);

  const filteredVehicles = useMemo(() => {
    switch (activeFilter) {
      case 'bikes':
        return availableVehicles.filter(vehicle => vehicle.type === 'bike');
      case 'cars':
        return availableVehicles.filter(vehicle => vehicle.type === 'car');
      case 'all':
      default:
        return availableVehicles;
    }
  }, [availableVehicles, activeFilter]);

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

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

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
          <button 
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All ({stats.totalAvailable})
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'bikes' ? 'active' : ''}`}
            onClick={() => handleFilterChange('bikes')}
          >
            Bikes ({stats.availableBikes})
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'cars' ? 'active' : ''}`}
            onClick={() => handleFilterChange('cars')}
          >
            Cars ({stats.availableCars})
          </button>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="vehicles-section">
        <div className="section-header">
          <h2>
            {activeFilter === 'all' ? 'Available Vehicles' : 
             activeFilter === 'bikes' ? 'Available Bikes' : 'Available Cars'}
             {' '}({filteredVehicles.length})
          </h2>
          <p>
            {activeFilter !== 'all' ? `Showing ${activeFilter} only • ` : ''}
            Sorted by date added (ascending) • Click to expand details
          </p>
        </div>

        {filteredVehicles.length > 0 ? (
          <VehicleAccordion
            vehicles={filteredVehicles}
            showRentButton={true}
            sortBy="createdDate"
          />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>
              {activeFilter === 'all' ? 'No Available Vehicles' :
               activeFilter === 'bikes' ? 'No Available Bikes' : 'No Available Cars'}
            </h3>
            <p>
              {activeFilter === 'all' 
                ? 'All vehicles are currently rented out. Add new vehicles or wait for returns to see available options.'
                : `No ${activeFilter} are currently available. Try filtering by "All" to see other vehicle types or add new ${activeFilter} to your fleet.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {filteredVehicles.length > 0 && (
        <div className="quick-actions">
          <div className="action-card">
            <div className="action-content">
              <h4>Ready for Business</h4>
              <p>
                {activeFilter === 'all' 
                  ? `You have ${stats.totalAvailable} vehicles ready to rent. Great availability rate of ${stats.availabilityRate}%!`
                  : `You have ${filteredVehicles.length} ${activeFilter} ready to rent out of ${stats.totalAvailable} total available vehicles.`
                }
              </p>
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