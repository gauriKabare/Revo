import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, SessionData, ProductsResponse, AdminLoginData, AdminOTPData } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  products: ProductsResponse | null;
  sessionData: SessionData | null;
  login: (username: string, password: string) => Promise<boolean>;
  adminLogin: (adminData: AdminLoginData) => Promise<{ success: boolean; requiresOTP?: boolean }>;
  verifyAdminOTP: (otpData: AdminOTPData) => Promise<boolean>;
  logout: () => void;
  refreshProducts: () => Promise<void>;
  setProducts: (products: ProductsResponse) => void;
  updateUser: (updatedUser: User) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProductsState] = useState<ProductsResponse | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const sessionDataString = sessionStorage.getItem('vehicleRentalSession');
        if (sessionDataString) {
          const parsedSession: SessionData = JSON.parse(sessionDataString);
          const userData: User = {
            id: parsedSession.userId,
            username: parsedSession.username,
            email: '',
            firstName: '',
            lastName: '',
            mobileNumber: '',
            role: (parsedSession as any).role || 'user',
            createdAt: new Date().toISOString()
          };
          setUser(userData);
          setProductsState(parsedSession.products);
          setSessionData(parsedSession);
          setIsAuthenticated(true);
          setIsAdmin(userData.role === 'admin');
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        sessionStorage.removeItem('vehicleRentalSession');
      }
    };

    checkExistingSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.signIn({ username, password });
      
      if (response.status === 'success') {
        // Extract JWT token from login response
        const token = response.data?.token;
        
        // Fetch products after successful login
        const productsResponse = await authAPI.getProducts();
        
        if (productsResponse.status === 'success') {
          const userData: User = {
            id: username, // Using username as ID for now
            username,
            email: '',
            firstName: '',
            lastName: '',
            mobileNumber: '',
            role: 'user',
            createdAt: new Date().toISOString()
          };

          const newSessionData: SessionData = {
            userId: username,
            username,
            products: productsResponse?.data || { bikes: [], cars: [] },
            token: token // Store JWT token
          };

          // Save to session storage
          sessionStorage.setItem('vehicleRentalSession', JSON.stringify(newSessionData));
          
          setUser(userData);
          setProductsState(productsResponse?.data || null);
          setSessionData(newSessionData);
          setIsAuthenticated(true);
          setIsAdmin(false);
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const adminLogin = async (adminData: AdminLoginData): Promise<{ success: boolean; requiresOTP?: boolean }> => {
    try {
      // First phase: username/password authentication
      if (!adminData.otp) {
        const response = await authAPI.adminSignIn({ username: adminData.username, password: adminData.password });
        
        if (response.status === 'success') {
          return { success: true, requiresOTP: true };
        }
        return { success: false };
      }
      
      // Second phase: OTP verification and full login
      const otpResponse = await authAPI.verifyAdminOTP({ username: adminData.username, otp: adminData.otp });
      
      if (otpResponse.status === 'success') {
        // Extract JWT token from admin OTP response
        const token = otpResponse.data?.token;
        
        // Fetch products after successful admin login
        const productsResponse = await authAPI.getProducts();
        
        if (productsResponse.status === 'success') {
          const userData: User = {
            id: adminData.username,
            username: adminData.username,
            email: '',
            firstName: '',
            lastName: '',
            mobileNumber: '',
            role: 'admin',
            createdAt: new Date().toISOString()
          };

          const newSessionData: SessionData = {
            userId: adminData.username,
            username: adminData.username,
            products: productsResponse?.data || { bikes: [], cars: [] },
            token: token // Store JWT token
          };

          // Add role to session data
          (newSessionData as any).role = 'admin';

          // Save to session storage
          sessionStorage.setItem('vehicleRentalSession', JSON.stringify(newSessionData));
          
          setUser(userData);
          setProductsState(productsResponse?.data || null);
          setSessionData(newSessionData);
          setIsAuthenticated(true);
          setIsAdmin(true);
          
          return { success: true };
        }
      }
      
      return { success: false };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false };
    }
  };

  const verifyAdminOTP = async (otpData: AdminOTPData): Promise<boolean> => {
    try {
      const response = await authAPI.verifyAdminOTP(otpData);
      return response.status === 'success';
    } catch (error) {
      console.error('Admin OTP verification error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await authAPI.signOut(user.username);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear session regardless of API call result
      sessionStorage.removeItem('vehicleRentalSession');
      setUser(null);
      setProductsState(null);
      setSessionData(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    switch (permission) {
      case 'admin':
        return user.role === 'admin';
      case 'make_available':
        return user.role === 'admin';
      case 'rental_history':
        return user.role === 'admin';
      default:
        return true; // Regular user permissions
    }
  };

  // Use useCallback to prevent function recreation on every render
  const refreshProducts = useCallback(async () => {
    try {
      console.log('Refreshing products...');
      const response = await authAPI.getProducts();
      console.log('Products response:', response);
      
      if (response.status === 'success') {
        const newProducts = response.data || { bikes: [], cars: [] };
        console.log('Setting new products:', newProducts);
        
        setProductsState(newProducts);
        
        // Update session storage
        const existingSession = sessionStorage.getItem('vehicleRentalSession');
        if (existingSession) {
          const currentSessionData = JSON.parse(existingSession);
          const updatedSessionData = {
            ...currentSessionData,
            products: newProducts
          };
          setSessionData(updatedSessionData);
          sessionStorage.setItem('vehicleRentalSession', JSON.stringify(updatedSessionData));
          console.log('Updated session data:', updatedSessionData);
        }
      } else {
        console.error('Failed to refresh products:', response.message);
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  }, []); // Empty dependency array since this function doesn't depend on any state

  const setProducts = useCallback((newProducts: ProductsResponse) => {
    setProductsState(newProducts);
    
    // Update session storage
    const existingSession = sessionStorage.getItem('vehicleRentalSession');
    if (existingSession) {
      const currentSessionData = JSON.parse(existingSession);
      const updatedSessionData = {
        ...currentSessionData,
        products: newProducts
      };
      setSessionData(updatedSessionData);
      sessionStorage.setItem('vehicleRentalSession', JSON.stringify(updatedSessionData));
    }
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    
    // Update session storage with new user data (preserve token and other data)
    const existingSession = sessionStorage.getItem('vehicleRentalSession');
    if (existingSession) {
      const currentSessionData = JSON.parse(existingSession);
      const updatedSessionData = {
        ...currentSessionData, // Preserve all existing data including token
        username: updatedUser.username,
        userId: updatedUser.id
      };
      setSessionData(updatedSessionData);
      sessionStorage.setItem('vehicleRentalSession', JSON.stringify(updatedSessionData));
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAdmin,
    products,
    sessionData,
    login,
    adminLogin,
    verifyAdminOTP,
    logout,
    refreshProducts,
    setProducts,
    updateUser,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 