import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Vehicle } from '../../types';
import './Dashboard.scss';

interface DashboardStats {
  totalVehicles: number;
  vehiclesOnRent: number;
  vehiclesAvailable: number;
  totalBikes: number;
  totalCars: number;
}

const Dashboard: React.FC = () => {
  const { products, refreshProducts } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    vehiclesOnRent: 0,
    vehiclesAvailable: 0,
    totalBikes: 0,
    totalCars: 0,
  });
  
  // Use ref to track if we've already fetched products on mount
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only refresh products once on component mount if we don't already have products
    if (!hasInitialized.current && !products) {
      hasInitialized.current = true;
      refreshProducts();
    }
  }, []); // Empty dependency array - only run on mount

  useEffect(() => {
    if (products) {
      const allVehicles: Vehicle[] = [...products.bikes, ...products.cars];
      
      const newStats: DashboardStats = {
        totalVehicles: allVehicles.length,
        vehiclesOnRent: allVehicles.filter(v => v.status === 'rented').length,
        vehiclesAvailable: allVehicles.filter(v => v.status === 'available').length,
        totalBikes: products.bikes.length,
        totalCars: products.cars.length,
      };
      
      setStats(newStats);
    }
  }, [products]);

  const dashboardCards = [
    {
      title: 'Catalogue',
      description: 'View all vehicles in your inventory',
      icon: '📋',
      path: '/catalogue',
      color: 'blue',
      stats: `${stats.totalBikes} Bikes • ${stats.totalCars} Cars`
    },
    {
      title: 'Add New Vehicle',
      description: 'Add bikes and cars to your fleet',
      icon: '➕',
      path: '/add-vehicle',
      color: 'green',
      stats: 'Expand your inventory'
    },
    {
      title: 'Vehicles On Rent',
      description: 'Manage currently rented vehicles',
      icon: '🚗',
      path: '/vehicles-on-rent',
      color: 'orange',
      stats: `${stats.vehiclesOnRent} vehicles rented`
    },
    {
      title: 'Vehicles Available',
      description: 'View and rent available vehicles',
      icon: '✅',
      path: '/vehicles-available',
      color: 'purple',
      stats: `${stats.vehiclesAvailable} vehicles ready`
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Business Overview</h2>
        <p>Manage your vehicle rental business efficiently</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalVehicles}</div>
            <div className="stat-label">Total Vehicles</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.vehiclesOnRent}</div>
            <div className="stat-label">On Rent</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✨</div>
          <div className="stat-content">
            <div className="stat-number">{stats.vehiclesAvailable}</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">
              {products ? 
                Math.round((stats.vehiclesOnRent / stats.totalVehicles) * 100) || 0 : 0}%
            </div>
            <div className="stat-label">Utilization</div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="dashboard-grid">
        {dashboardCards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className={`dashboard-card dashboard-card-${card.color}`}
          >
            <div className="card-header">
              <div className="card-icon">{card.icon}</div>
              <h3 className="card-title">{card.title}</h3>
            </div>
            <p className="card-description">{card.description}</p>
            <div className="card-stats">{card.stats}</div>
            <div className="card-arrow">→</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Link to="/add-vehicle" className="btn btn-primary">
            Add Vehicle
          </Link>
          <Link to="/catalogue" className="btn btn-secondary">
            View Catalogue
          </Link>
          <Link to="/vehicles-on-rent" className="btn btn-outline">
            Manage Rentals
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 