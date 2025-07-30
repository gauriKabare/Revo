import React, { useState } from 'react';
import { Vehicle, UpdateRentalFormData } from '../../types';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './UpdateRentalModal.scss';

interface UpdateRentalModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onUpdate: (updatedVehicle: Vehicle) => void;
}

const UpdateRentalModal: React.FC<UpdateRentalModalProps> = ({ 
  vehicle, 
  onClose, 
  onUpdate 
}) => {
  const { refreshProducts } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [formData, setFormData] = useState<UpdateRentalFormData>({
    customerName: vehicle.rentalInfo?.customerName || '',
    customerNumber: vehicle.rentalInfo?.customerNumber || '',
    customerPAN: vehicle.rentalInfo?.customerPAN || '',
    customerAadhar: vehicle.rentalInfo?.customerAadhar || '',
    fromDate: vehicle.rentalInfo?.fromDate || '',
    toDate: vehicle.rentalInfo?.toDate || '',
    totalPaid: vehicle.rentalInfo?.totalPaid || 0,
    totalDue: 0
  });

  // Calculate total due whenever dates or rate change
  React.useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      const fromDate = new Date(formData.fromDate);
      const toDate = new Date(formData.toDate);
      const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
      const totalAmount = days * vehicle.rate;
      const totalDue = Math.max(0, totalAmount - formData.totalPaid);
      
      setFormData(prev => ({ ...prev, totalDue }));
    }
  }, [formData.fromDate, formData.toDate, formData.totalPaid, vehicle.rate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'totalPaid' ? parseFloat(value) || 0 : value 
    }));
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
      const response = await authAPI.updateRental(vehicle.id, formData);
      
      if (response.status === 'success') {
        setMessage('Rental information updated successfully!');
        setMessageType('success');
        
        // Update the vehicle object
        const updatedVehicle: Vehicle = {
          ...vehicle,
          rentalInfo: {
            ...formData,
            totalDue: formData.totalDue
          }
        };
        
        // Refresh products and update parent component
        setTimeout(async () => {
          await refreshProducts();
          onUpdate(updatedVehicle);
        }, 1500);
      } else {
        setMessage(response.message || 'Failed to update rental information');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
    
    setLoading(false);
  };

  const calculateDays = () => {
    if (formData.fromDate && formData.toDate) {
      const fromDate = new Date(formData.fromDate);
      const toDate = new Date(formData.toDate);
      return Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
    }
    return 0;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content update-rental-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Rental Information</h3>
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

          <form onSubmit={handleSubmit} className="update-rental-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerName">Customer Name</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  className="form-control readonly"
                  disabled
                  readOnly
                />
                <small className="form-text">Read-only field</small>
              </div>

              <div className="form-group">
                <label htmlFor="customerNumber">Contact Number</label>
                <div className="editable-field-group">
                  <input
                    type="tel"
                    id="customerNumber"
                    name="customerNumber"
                    value={formData.customerNumber}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="10-digit number"
                    disabled={loading || !isEditingPhone}
                    readOnly={!isEditingPhone}
                  />
                  <button
                    type="button"
                    className="edit-toggle-btn"
                    onClick={() => setIsEditingPhone(!isEditingPhone)}
                    disabled={loading}
                  >
                    {isEditingPhone ? '💾' : '✏️'}
                  </button>
                </div>
                {isEditingPhone && <small className="form-text">Click save icon to confirm</small>}
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
                  className="form-control readonly"
                  disabled
                  readOnly
                />
                <small className="form-text">Read-only field</small>
              </div>

              <div className="form-group">
                <label htmlFor="customerAadhar">Aadhar Number</label>
                <input
                  type="text"
                  id="customerAadhar"
                  name="customerAadhar"
                  value={formData.customerAadhar}
                  className="form-control readonly"
                  disabled
                  readOnly
                />
                <small className="form-text">Read-only field</small>
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
                  className="form-control readonly"
                  disabled
                  readOnly
                />
                <small className="form-text">Read-only field</small>
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
                <small className="form-text">Editable field</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="totalPaid">Total Paid (₹)</label>
                <input
                  type="number"
                  id="totalPaid"
                  name="totalPaid"
                  value={formData.totalPaid}
                  onChange={handleInputChange}
                  className="form-control"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="totalDue">Total Due (₹)</label>
                <input
                  type="number"
                  id="totalDue"
                  name="totalDue"
                  value={formData.totalDue}
                  className="form-control readonly"
                  disabled
                  readOnly
                />
                <small className="form-text">Auto-calculated</small>
              </div>
            </div>

            <div className="rental-summary">
              <div className="summary-row">
                <span>Rental Duration:</span>
                <span>{calculateDays()} day(s)</span>
              </div>
              <div className="summary-row">
                <span>Rate per day:</span>
                <span>₹{vehicle.rate}</span>
              </div>
              <div className="summary-row">
                <span>Total Amount:</span>
                <span>₹{calculateDays() * vehicle.rate}</span>
              </div>
              <div className="summary-row total">
                <span>Amount Due:</span>
                <span>₹{formData.totalDue}</span>
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
                {loading ? 'Updating...' : 'Update Rental'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateRentalModal; 