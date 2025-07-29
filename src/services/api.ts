import { 
  LoginCredentials, 
  CreateAccountData, 
  ApiResponse, 
  ProductsResponse, 
  OwnerResponse,
  RentNowFormData,
  AddVehicleFormData,
  UpdateRentalFormData
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for making API calls
const apiCall = async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return {
      status: 'failure',
      message: 'Network error occurred'
    };
  }
};

export const authAPI = {
  // 1. Sign In
  signIn: async (credentials: LoginCredentials): Promise<ApiResponse> => {
    return apiCall('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // 2. User Creation
  createUser: async (userData: CreateAccountData): Promise<ApiResponse> => {
    return apiCall('/auth/create-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // 3. Get Products
  getProducts: async (): Promise<ApiResponse<ProductsResponse>> => {
    return apiCall('/products');
  },

  // 4. Get Owner Profile
  getOwner: async (username: string): Promise<ApiResponse<OwnerResponse>> => {
    return apiCall(`/owner/${username}`);
  },

  // 5. Check Availability
  checkAvailability: async (productId: string): Promise<ApiResponse<{fromDate: string, toDate: string}>> => {
    return apiCall(`/availability/${productId}`);
  },

  // 6. Rent Now
  rentNow: async (productId: string, rentalData: RentNowFormData): Promise<ApiResponse> => {
    return apiCall('/rent-now', {
      method: 'POST',
      body: JSON.stringify({ productId, ...rentalData }),
    });
  },

  // 7. Make Available
  makeAvailable: async (productId: string): Promise<ApiResponse> => {
    return apiCall('/make-available', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // 8. Sign Out
  signOut: async (username: string): Promise<ApiResponse> => {
    return apiCall('/auth/signout', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  },

  // 9. Update Rental
  updateRental: async (productId: string, rentalData: UpdateRentalFormData): Promise<ApiResponse> => {
    return apiCall('/update-rental', {
      method: 'PUT',
      body: JSON.stringify({ productId, ...rentalData }),
    });
  },

  // 10. Add Product
  addProduct: async (productData: AddVehicleFormData): Promise<ApiResponse> => {
    return apiCall('/add-product', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },
}; 