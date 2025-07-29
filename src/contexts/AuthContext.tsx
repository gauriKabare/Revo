import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SessionData, ProductsResponse } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  products: ProductsResponse | null;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const sessionData = sessionStorage.getItem('vehicleRentalSession');
        if (sessionData) {
          const parsedSession: SessionData = JSON.parse(sessionData);
          setUser({
            id: parsedSession.userId,
            username: parsedSession.username,
            email: '',
            mobileNumber: '',
            password: ''
          });
          setProductsState(parsedSession.products);
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

          const sessionData: SessionData = {
            userId: username,
            username,
            products: productsResponse?.data
          };

          // Save to session storage
          sessionStorage.setItem('vehicleRentalSession', JSON.stringify(sessionData));
          
          setUser(userData);
          setProductsState(productsResponse?.data);
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
      setIsAuthenticated(false);
    }
  };

  const refreshProducts = async () => {
    try {
      const response = await authAPI.getProducts();
      if (response.status === 'success') {
        setProductsState(response.data);
        
        // Update session storage
        const existingSession = sessionStorage.getItem('vehicleRentalSession');
        if (existingSession) {
          const sessionData = JSON.parse(existingSession);
          sessionData.products = response.data;
          sessionStorage.setItem('vehicleRentalSession', JSON.stringify(sessionData));
        }
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  const setProducts = (newProducts: ProductsResponse) => {
    setProductsState(newProducts);
    
    // Update session storage
    const existingSession = sessionStorage.getItem('vehicleRentalSession');
    if (existingSession) {
      const sessionData = JSON.parse(existingSession);
      sessionData.products = newProducts;
      sessionStorage.setItem('vehicleRentalSession', JSON.stringify(sessionData));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    products,
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