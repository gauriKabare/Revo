import React, { useState } from 'react';
import { Vehicle, RentNowFormData } from '../../types';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './RentModal.scss';

interface RentModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

const RentModal: React.FC<RentModalProps> = ({ vehicle, onClose }) => {
  const { refreshProducts } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  const [formData, setFormData] = useState<RentNowFormData>({
    customerName: '',
    customerNumber: '',
    customerPAN: '',
    customerAadhar: '',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message) setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Basic validation
    if (!formData.customerName || !formData.customerNumber || !formData.customerPAN || 
        !formData.customerAadhar || !formData.fromDate || !formData.toDate) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // Date validation
    if (new Date(formData.toDate) <= new Date(formData.fromDate)) {
      setMessage('End date must be after start date');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // Check availability first
      const availabilityResponse = await authAPI.checkAvailability(vehicle.id);
      
      if (availabilityResponse.status === 'success') {
        // Proceed with rental
        const response = await authAPI.rentNow(vehicle.id, formData);
        
        if (response.status === 'success') {
          setMessage('Vehicle rented successfully!');
          setMessageType('success');
          
          // Refresh products and close modal after a delay
          setTimeout(async () => {
            await refreshProducts();
            onClose();
          }, 1500);
        } else {
          setMessage(response.message || 'Failed to rent vehicle');
          setMessageType('error');
        }
      } else {
        setMessage('Failed to check vehicle availability');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
    
    setLoading(false);
  };

  const calculateEstimatedCost = () => {
    if (formData.fromDate && formData.toDate) {
      const start = new Date(formData.fromDate);
      const end = new Date(formData.toDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      return days * vehicle.rate;
    }
    return 0;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Rent {vehicle.name}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="vehicle-summary">
            <img src={vehicle.photos[0]} alt={vehicle.name} />
            <div className="vehicle-info">
              <h4>{vehicle.name}</h4>
              <p>{vehicle.model} • ₹{vehicle.rate}/day</p>
            </div>
          </div>

          {message && (
            <div className={`message ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="rent-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerName">Customer Name</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Full name"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="customerNumber">Contact Number</label>
                <input
                  type="tel"
                  id="customerNumber"
                  name="customerNumber"
                  value={formData.customerNumber}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="10-digit number"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerPAN">PAN Number</label>
                <input
                  type="text"
                  id="customerPAN"
                  name="customerPAN"
                  value={formData.customerPAN}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="ABCDE1234F"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="customerAadhar">Aadhar Number</label>
                <input
                  type="text"
                  id="customerAadhar"
                  name="customerAadhar"
                  value={formData.customerAadhar}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="12-digit number"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fromDate">From Date</label>
                <input
                  type="date"
                  id="fromDate"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="toDate">To Date</label>
                <input
                  type="date"
                  id="toDate"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="cost-summary">
              <div className="cost-item">
                <span>Estimated Cost:</span>
                <span className="cost-amount">₹{calculateEstimatedCost()}</span>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Rent Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RentModal; 