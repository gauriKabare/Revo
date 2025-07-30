import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, SessionData, ProductsResponse } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  products: ProductsResponse | null;
  sessionData: SessionData | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshProducts: () => Promise<void>;
  setProducts: (products: ProductsResponse) => void;
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

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const sessionDataString = sessionStorage.getItem('vehicleRentalSession');
        if (sessionDataString) {
          const parsedSession: SessionData = JSON.parse(sessionDataString);
          setUser({
            id: parsedSession.userId,
            username: parsedSession.username,
            email: '',
            mobileNumber: '',
            password: ''
          });
          setProductsState(parsedSession.products);
          setSessionData(parsedSession);
          setIsAuthenticated(true);
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
        // Fetch products after successful login
        const productsResponse = await authAPI.getProducts();
        
        if (productsResponse.status === 'success') {
          const userData: User = {
            id: username, // Using username as ID for now
            username,
            email: '',
            mobileNumber: '',
            password: ''
          };

          const newSessionData: SessionData = {
            userId: username,
            username,
            products: productsResponse?.data || { bikes: [], cars: [] }
          };

          // Save to session storage
          sessionStorage.setItem('vehicleRentalSession', JSON.stringify(newSessionData));
          
          setUser(userData);
          setProductsState(productsResponse?.data || null);
          setSessionData(newSessionData);
          setIsAuthenticated(true);
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
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

  const value: AuthContextType = {
    user,
    isAuthenticated,
    products,
    sessionData,
    login,
    logout,
    refreshProducts,
    setProducts
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 