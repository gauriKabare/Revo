import React from 'react';
import { useParams } from 'react-router-dom';

const VehicleDetail: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();

  return (
    <div className="vehicle-detail">
      <h2>Vehicle Detail Page</h2>
      <p>This is a placeholder for the vehicle detail page.</p>
      <p>Type: {type}</p>
      <p>ID: {id}</p>
      <p>This component will show detailed information about the selected vehicle, including photo carousel, rental information, and action buttons.</p>
    </div>
  );
};

export default VehicleDetail; 