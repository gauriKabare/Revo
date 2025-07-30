import React from 'react';
import './RevoLogo.scss';

interface RevoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const RevoLogo: React.FC<RevoLogoProps> = ({ 
  size = 'md', 
  animated = true, 
  className = '' 
}) => {
  return (
    <div className={`revo-logo revo-logo-${size} ${animated ? 'animated' : ''} ${className}`}>
      <div className="logo-container">
        <div className="logo-text">
          <span className="letter letter-r">R</span>
          <span className="letter letter-e">e</span>
          <span className="letter letter-v">v</span>
          <span className="letter letter-o">o</span>
        </div>
        <div className="logo-underline"></div>
        <div className="logo-glow"></div>
      </div>
      <div className="logo-tagline">Vehicle Rental System</div>
    </div>
  );
};

export default RevoLogo; 