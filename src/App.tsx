import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import AdminLogin from './components/Auth/AdminLogin';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import Catalogue from './components/Catalogue/Catalogue';
import VehicleDetail from './components/Catalogue/VehicleDetail';
import AddVehicle from './components/Vehicles/AddVehicle';
import VehiclesOnRent from './components/Vehicles/VehiclesOnRent';
import VehiclesAvailable from './components/Vehicles/VehiclesAvailable';
import RentalHistory from './components/Admin/RentalHistory';
import Layout from './components/Layout/Layout';
import './styles/globals.scss';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/admin-login"
              element={
                <PublicRoute>
                  <AdminLogin />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
                              <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="catalogue" element={<Catalogue />} />
                <Route path="catalogue/:type/:id" element={<VehicleDetail />} />
                <Route path="add-vehicle" element={<AddVehicle />} />
                <Route path="vehicles-on-rent" element={<VehiclesOnRent />} />
                <Route path="vehicles-available" element={<VehiclesAvailable />} />
                <Route path="rental-history" element={<RentalHistory />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 