import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import VehicleAccordion from '../common/VehicleAccordion';
import './VehiclesOnRent.scss';

const VehiclesOnRent: React.FC = () => {
  const { sessionData } = useAuth();

  const rentedVehicles = useMemo(() => {
    if (!sessionData) return [];
    
    const allVehicles = [...sessionData.products.bikes, ...sessionData.products.cars];
    return allVehicles.filter(vehicle => vehicle.status === 'rented' && vehicle.isRentedFlag);
  }, [sessionData]);

  const calculateStats = () => {
    const totalRented = rentedVehicles.length;
    const lateVehicles = rentedVehicles.filter(vehicle => {
      if (!vehicle.rentalInfo) return false;
      const toDate = new Date(vehicle.rentalInfo.toDate);
      const today = new Date();
      return today > toDate;
    }).length;
    
    const totalRevenue = rentedVehicles.reduce((sum, vehicle) => {
      if (!vehicle.rentalInfo) return sum;
      const fromDate = new Date(vehicle.rentalInfo.fromDate);
      const toDate = new Date(vehicle.rentalInfo.toDate);
      const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
      return sum + (days * vehicle.rate);
    }, 0);

    return { totalRented, lateVehicles, totalRevenue };
  };

  const stats = calculateStats();

  return (
    <div className="vehicles-on-rent">
      <div className="page-header">
        <h1>Vehicles On Rent</h1>
        <p>Manage all currently rented vehicles</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>{stats.totalRented}</h3>
            <p>Total Rented</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.lateVehicles}</h3>
            <p>Overdue Returns</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{sessionData ? Math.round((stats.totalRented / (sessionData.products.bikes.length + sessionData.products.cars.length)) * 100) : 0}%</h3>
            <p>Utilization Rate</p>
          </div>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="vehicles-section">
        <div className="section-header">
          <h2>Rented Vehicles</h2>
          <p>Sorted by rental start date (ascending)</p>
        </div>

        {rentedVehicles.length > 0 ? (
          <VehicleAccordion
            vehicles={rentedVehicles}
            showMakeAvailableButton={true}
            sortBy="rentDate"
          />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h3>No Vehicles Currently Rented</h3>
            <p>All vehicles are available for rental. Great job managing your fleet!</p>
          </div>
        )}
      </div>

      {/* Late Returns Alert */}
      {stats.lateVehicles > 0 && (
        <div className="alert-section">
          <div className="alert alert-warning">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h4>Attention Required</h4>
              <p>
                You have {stats.lateVehicles} vehicle{stats.lateVehicles > 1 ? 's' : ''} overdue for return. 
                Please contact the customers to arrange return or extension.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesOnRent; 