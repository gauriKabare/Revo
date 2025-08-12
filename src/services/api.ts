import { 
  LoginCredentials, 
  CreateAccountData, 
  ApiResponse, 
  ProductsResponse, 
  OwnerResponse,
  RentNowFormData,
  AddVehicleFormData,
  UpdateRentalFormData,
  ForgotPasswordPhoneData,
  ForgotPasswordOTPData,
  UpdateUserPasswordData,
  AdminLoginData,
  AdminOTPData,
  RentalHistoryRecord
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for making API calls
const apiCall = async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  try {
    // Get JWT token from session storage
    const sessionData = sessionStorage.getItem('vehicleRentalSession');
    let token = null;
    
    if (sessionData) {
      try {
        const parsedSession = JSON.parse(sessionData);
        token = parsedSession.token;
      } catch (e) {
        console.warn('Failed to parse session data:', e);
      }
    }

    // Don't set Content-Type for FormData - let browser set it with boundary
    const headers: HeadersInit = options.body instanceof FormData 
      ? { 
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers 
        }
      : { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers 
        };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
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

  // 11. Update Vehicle
  updateVehicle: async (updateData: any): Promise<ApiResponse> => {
    return apiCall('/update-vehicle', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // 12. Update Profile
  updateProfile: async (profileData: { email: string; firstName: string; lastName: string; mobileNumber: string; profilePhoto?: string }): Promise<ApiResponse> => {
    return apiCall('/profile/update', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // 13. Change Password - Step 1
  changePasswordStep1: async (passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse> => {
    return apiCall('/profile/change-password/step1', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },

  // 14. Change Password - Step 2
  changePasswordStep2: async (otpData: { username: string; newPassword: string; otp: string }): Promise<ApiResponse> => {
    return apiCall('/profile/change-password/step2', {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
  },

  // 15. Forgot Password - Verify Phone Number
  verifyPhoneNumber: async (phoneData: ForgotPasswordPhoneData): Promise<ApiResponse> => {
    return apiCall('/auth/forgot-password/verify-phone', {
      method: 'POST',
      body: JSON.stringify(phoneData),
    });
  },

  // 16. Forgot Password - Verify OTP
  verifyOTP: async (otpData: ForgotPasswordOTPData): Promise<ApiResponse> => {
    return apiCall('/auth/forgot-password/verify-otp', {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
  },

  // 17. Update User Password
  updateUser: async (updateData: UpdateUserPasswordData): Promise<ApiResponse> => {
    return apiCall('/auth/update-user', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // 18. Admin Sign In (first phase)
  adminSignIn: async (credentials: LoginCredentials): Promise<ApiResponse> => {
    return apiCall('/auth/admin-signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // 19. Admin OTP Verification
  verifyAdminOTP: async (otpData: AdminOTPData): Promise<ApiResponse> => {
    return apiCall('/auth/admin-verify-otp', {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
  },

  // 20. Get Rental History (Admin only)
  getRentalHistory: async (): Promise<ApiResponse<RentalHistoryRecord[]>> => {
    return apiCall('/admin/rental-history', {
      method: 'GET',
    });
  },
}; 