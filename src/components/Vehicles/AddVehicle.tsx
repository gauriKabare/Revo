import React, { useState } from 'react';
import { AddVehicleFormData } from '../../types';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './AddVehicle.scss';

interface AddVehicleProps {
  onClose: () => void;
}

const AddVehicle: React.FC<AddVehicleProps> = ({ onClose }) => {
  const { refreshProducts } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  const [formData, setFormData] = useState<AddVehicleFormData>({
    photos: [],
    name: '',
    model: '',
    type: 'bike',
    availability: 'available',
    manufacturingYear: new Date().getFullYear(),
    rate: 0
  });

  const [photoUrls, setPhotoUrls] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rate' || name === 'manufacturingYear' ? parseFloat(value) || 0 : value
    }));
    if (message) setMessage('');
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const urls = e.target.value;
    setPhotoUrls(urls);
    
    // Split URLs by new lines and filter out empty strings
    const urlArray = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    setFormData(prev => ({ ...prev, photos: urlArray }));
    if (message) setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Basic validation
    if (!formData.name || !formData.model || !formData.type || 
        formData.manufacturingYear < 1900 || formData.rate <= 0) {
      setMessage('Please fill in all fields with valid values');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (formData.photos.length === 0) {
      setMessage('Please add at least one photo URL');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // Year validation
    const currentYear = new Date().getFullYear();
    if (formData.manufacturingYear > currentYear) {
      setMessage('Manufacturing year cannot be in the future');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.addProduct(formData);
      
      if (response.status === 'success') {
        setMessage('Vehicle added successfully!');
        setMessageType('success');
        
        // Refresh products immediately and close modal after a delay
        await refreshProducts();
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage(response.message || 'Failed to add vehicle');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
    
    setLoading(false);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1950; year--) {
      years.push(year);
    }
    return years;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content add-vehicle-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Vehicle</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {message && (
            <div className={`message ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="add-vehicle-form">
            {/* Photo URLs */}
            <div className="form-group">
              <label htmlFor="photos">Vehicle Photos (URLs)</label>
              <textarea
                id="photos"
                name="photos"
                value={photoUrls}
                onChange={handlePhotosChange}
                className="form-control photo-urls-input"
                placeholder="Enter image URLs, one per line:&#13;&#10;https://example.com/image1.jpg&#13;&#10;https://example.com/image2.jpg"
                rows={4}
                disabled={loading}
              />
              <small className="form-text">Enter one URL per line. First image will be the main photo.</small>
              {formData.photos.length > 0 && (
                <div className="photo-preview">
                  <h4>Preview ({formData.photos.length} photo{formData.photos.length > 1 ? 's' : ''})</h4>
                  <div className="photo-grid">
                    {formData.photos.slice(0, 4).map((url, index) => (
                      <div key={index} className="photo-item">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/150x100?text=Invalid+URL';
                          }}
                        />
                        {index === 0 && <span className="main-badge">Main</span>}
                      </div>
                    ))}
                    {formData.photos.length > 4 && (
                      <div className="photo-item more-photos">
                        <span>+{formData.photos.length - 4} more</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Vehicle Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g., Honda Activa 6G"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="model">Model</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g., Activa 6G"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Vehicle Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={loading}
                  required
                >
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="availability">Availability Status</label>
                <select
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={loading}
                  required
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="manufacturingYear">Manufacturing Year</label>
                <select
                  id="manufacturingYear"
                  name="manufacturingYear"
                  value={formData.manufacturingYear}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={loading}
                  required
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="rate">Rate per Day (₹)</label>
                <input
                  type="number"
                  id="rate"
                  name="rate"
                  value={formData.rate}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="0"
                  min="1"
                  step="1"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Form Summary */}
            {formData.name && formData.rate > 0 && (
              <div className="form-summary">
                <h4>Vehicle Summary</h4>
                <div className="summary-content">
                  <p><strong>{formData.name}</strong> ({formData.model})</p>
                  <p>{formData.type.toUpperCase()} • {formData.manufacturingYear} • ₹{formData.rate}/day</p>
                  <p>Status: <span className={`status-${formData.availability}`}>{formData.availability.toUpperCase()}</span></p>
                </div>
              </div>
            )}

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
                {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AddVehiclePage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="add-vehicle-page">
      <div className="page-header">
        <h1>Add New Vehicle</h1>
        <p>Add a new vehicle to your rental catalogue</p>
      </div>

      <div className="page-content">
        <button
          className="btn btn-primary btn-lg add-vehicle-trigger"
          onClick={() => setShowModal(true)}
        >
          ➕ Add New Vehicle
        </button>
      </div>

      {showModal && (
        <AddVehicle onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default AddVehiclePage; 