import React, { useState, useEffect } from 'react';
import { Vehicle } from '../../types';
import { authAPI } from '../../services/api';
import './EditVehicleModal.scss';

interface EditVehicleModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onUpdate: (updatedVehicle: Vehicle) => void;
}

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({ vehicle, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    type: 'bike' as 'bike' | 'car',
    manufacturingYear: new Date().getFullYear(),
    rate: 0,
    photos: [] as string[]
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        model: vehicle.model,
        type: vehicle.type,
        manufacturingYear: vehicle.manufacturingYear,
        rate: vehicle.rate,
        photos: vehicle.photos || []
      });
    }
  }, [vehicle]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'manufacturingYear' || name === 'rate' ? Number(value) : value
    }));
  };

  const handlePhotoUrlChange = (index: number, value: string) => {
    const newPhotos = [...formData.photos];
    newPhotos[index] = value;
    setFormData(prev => ({ ...prev, photos: newPhotos }));
  };

  const addPhotoUrl = () => {
    setFormData(prev => ({ 
      ...prev, 
      photos: [...prev.photos, ''] 
    }));
  };

  const removePhotoUrl = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, photos: newPhotos }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicle) return;

    // Validation
    if (!formData.name.trim() || !formData.model.trim()) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return;
    }

    if (formData.rate <= 0) {
      setMessage('Rate must be greater than 0');
      setMessageType('error');
      return;
    }

    if (formData.manufacturingYear < 1980 || formData.manufacturingYear > new Date().getFullYear()) {
      setMessage('Please enter a valid manufacturing year');
      setMessageType('error');
      return;
    }

    const validPhotos = formData.photos.filter(photo => photo.trim() !== '');
    if (validPhotos.length === 0) {
      setMessage('Please add at least one photo URL');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const updateData = {
        id: vehicle.id,
        name: formData.name,
        model: formData.model,
        manufacturingYear: formData.manufacturingYear,
        rate: formData.rate,
        photos: validPhotos
      };

      const response = await authAPI.updateVehicle(updateData);

      if (response.status === 'success') {
        const updatedVehicle: Vehicle = {
          ...vehicle,
          ...formData,
          photos: validPhotos
        };
        
        onUpdate(updatedVehicle);
        setMessage('Vehicle updated successfully!');
        setMessageType('success');
      } else {
        setMessage(response.message || 'Failed to update vehicle');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Update vehicle error:', error);
      setMessage('An error occurred while updating the vehicle');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="edit-vehicle-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Vehicle</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-vehicle-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Vehicle Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g., Honda CB350"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="model">Model *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g., CB350"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-control"
                disabled
                required
              >
                <option value="bike">Bike</option>
                <option value="car">Car</option>
              </select>
              <small style={{ color: '#B3B3B3', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Vehicle type cannot be changed
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="manufacturingYear">Manufacturing Year *</label>
              <input
                type="number"
                id="manufacturingYear"
                name="manufacturingYear"
                value={formData.manufacturingYear}
                onChange={handleInputChange}
                className="form-control"
                min="1980"
                max={new Date().getFullYear()}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="rate">Rate per Day (₹) *</label>
            <input
              type="number"
              id="rate"
              name="rate"
              value={formData.rate}
              onChange={handleInputChange}
              className="form-control"
              min="1"
              step="1"
              placeholder="e.g., 500"
              required
            />
          </div>

          <div className="form-group">
            <label>Photo URLs *</label>
            {formData.photos.map((photo, index) => (
              <div key={index} className="photo-input-row">
                <input
                  type="url"
                  value={photo}
                  onChange={(e) => handlePhotoUrlChange(index, e.target.value)}
                  className="form-control"
                  placeholder="https://example.com/photo.jpg"
                />
                <button
                  type="button"
                  onClick={() => removePhotoUrl(index)}
                  className="btn btn-outline btn-sm remove-photo-btn"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addPhotoUrl}
              className="btn btn-outline add-photo-btn"
            >
              + Add Photo URL
            </button>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVehicleModal; 