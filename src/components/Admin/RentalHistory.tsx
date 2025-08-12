import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { RentalHistoryRecord } from '../../types';
import './RentalHistory.scss';

const RentalHistory: React.FC = () => {
  const [rentalHistory, setRentalHistory] = useState<RentalHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasPermission('rental_history')) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    fetchRentalHistory();
  }, [hasPermission]);

  const fetchRentalHistory = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getRentalHistory();
      
      if (response.status === 'success') {
        setRentalHistory(response.data || []);
      } else {
        setError('Failed to fetch rental history');
      }
    } catch (error) {
      console.error('Error fetching rental history:', error);
      setError('An error occurred while fetching rental history');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = rentalHistory.filter(record => {
    if (filter === 'all') return true;
    return record.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00F5FF';
      case 'completed': return '#00FF88';
      case 'overdue': return '#FF3366';
      default: return '#888';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDetails = (record: RentalHistoryRecord) => {
    navigate(`/catalogue/${record.vehicleType}/${record.vehicleId}`);
  };

  const handleFollowUp = (record: RentalHistoryRecord) => {
    // TODO: Implement follow-up functionality (email, SMS, etc.)
    console.log('Follow up for rental:', record.id);
    // For now, just show an alert
    alert(`Follow-up initiated for ${record.userName} regarding ${record.vehicleName}`);
  };

  if (!hasPermission('rental_history')) {
    return (
      <div className="rental-history-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Admin privileges required to view rental history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rental-history-container">
      <div className="rental-history-header">
        <div className="header-content">
          <h1>Rental History</h1>
          <p>Admin Dashboard - Complete rental records overview</p>
        </div>
        
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{rentalHistory.length}</span>
            <span className="stat-label">Total Rentals</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{rentalHistory.filter(r => r.status === 'active').length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{rentalHistory.filter(r => r.status === 'completed').length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{rentalHistory.filter(r => r.status === 'overdue').length}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>
      </div>

      <div className="filter-controls">
        <div className="filter-tabs">
          {['all', 'active', 'completed', 'overdue'].map(status => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status as any)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="count">
                {status === 'all' ? rentalHistory.length : rentalHistory.filter(r => r.status === status).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading rental history...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchRentalHistory}>
            Retry
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-state">
          <h3>No Rental Records</h3>
          <p>No rental records found for the selected filter.</p>
        </div>
      ) : (
        <div className="rental-cards-container">
          {filteredHistory.map(record => (
            <div key={record.id} className="rental-card">
              <div className="card-header">
                <div className="rental-id">#{record.id}</div>
                <div className={`status-badge status-${record.status}`}>
                  {record.status.toUpperCase()}
                </div>
              </div>

              <div className="card-content">
                <div className="rental-info">
                  <div className="info-section">
                    <h4>Customer</h4>
                    <p className="customer-name">{record.userName}</p>
                    <p className="user-id">ID: {record.userId}</p>
                  </div>

                  <div className="info-section">
                    <h4>Vehicle</h4>
                    <p className="vehicle-name">{record.vehicleName}</p>
                    <p className="vehicle-details">{record.vehicleModel} • {record.vehicleType}</p>
                  </div>

                  <div className="info-section">
                    <h4>Duration</h4>
                    <p className="duration">{calculateDuration(record.startDate, record.endDate)} days</p>
                    <p className="date-range">
                      {formatDate(record.startDate)} → {formatDate(record.endDate)}
                    </p>
                  </div>

                  <div className="info-section">
                    <h4>Amount</h4>
                    <p className="rent-amount">₹{record.rentAmount.toLocaleString()}</p>
                    <p className="amount-label">Total Rent</p>
                  </div>
                </div>

                {record.returnDate && (
                  <div className="return-info">
                    <h4>Return Date</h4>
                    <p>{formatDate(record.returnDate)}</p>
                    {record.status === 'overdue' && (
                      <p className="overdue-warning">Returned late</p>
                    )}
                  </div>
                )}
              </div>

              <div className="card-footer">
                <div className="created-date">
                  Created: {formatDate(record.createdAt)}
                </div>
                <div className="actions">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleViewDetails(record)}
                  >
                    View Details
                  </button>
                  {record.status === 'overdue' && (
                    <button 
                      className="btn btn-warning btn-sm"
                      onClick={() => handleFollowUp(record)}
                    >
                      Follow Up
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RentalHistory; 