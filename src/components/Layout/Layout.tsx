import React, { useState, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.scss';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasPermission, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const allNavigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠', permission: null },
    { label: 'Profile', path: '/profile', icon: '👤', permission: null },
    { label: 'Catalogue', path: '/catalogue', icon: '📋', permission: null },
    { label: 'Add New Vehicle', path: '/add-vehicle', icon: '➕', permission: 'admin', adminOnly: true },
    { label: 'Vehicles On Rent', path: '/vehicles-on-rent', icon: '🚗', permission: null },
    { label: 'Vehicles Available', path: '/vehicles-available', icon: '✅', permission: null },
    { label: 'Rental History', path: '/rental-history', icon: '📊', permission: 'rental_history', adminOnly: true },
  ];

  const navigationItems = useMemo(() => {
    return allNavigationItems.map(item => ({
      ...item,
      isLocked: item.permission && !hasPermission(item.permission)
    }));
  }, [hasPermission]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn show-mobile-only"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Vehicle Rental</h2>
          <button
            className="sidebar-close show-mobile-only"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            if (item.isLocked) {
              return (
                <div 
                  key={item.path}
                  className={`nav-item nav-item-locked ${isActive(item.path) ? 'nav-item-active' : ''}`}
                  title="Admin access required"
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  <span className="lock-icon">🔒</span>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay show-mobile-only"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-content">
            <h1 className="page-title">
              {navigationItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h1>
            <div className="header-user">
              <span className="user-welcome">Welcome, {user?.username}</span>
              {isAdmin && (
                <span className="admin-badge">
                  <span className="admin-icon">🔐</span>
                  Admin
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout; 