// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  mobileNumber: string;
  password: string;
  profilePhoto?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateAccountData {
  email: string;
  mobileNumber: string;
  username: string;
  password: string;
  retypePassword: string;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  photos: string[];
  name: string;
  model: string;
  type: 'bike' | 'car';
  availability: 'available' | 'rented';
  manufacturingYear: number;
  rate: number;
  status: 'available' | 'rented';
  isRentedFlag: boolean;
  rentalInfo?: RentalInfo;
  createdDate: string;
}

export interface RentalInfo {
  customerName: string;
  customerNumber: string;
  customerPAN: string;
  customerAadhar: string;
  fromDate: string;
  toDate: string;
  totalPaid?: number;
  totalDue?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'failure';
  data?: T;
  message?: string;
}

export interface ProductsResponse {
  bikes: Vehicle[];
  cars: Vehicle[];
}

export interface OwnerResponse {
  username: string;
  profilePhoto?: string;
  contactNumber: string;
  email: string;
}

// Form Types
export interface RentNowFormData {
  customerName: string;
  customerNumber: string;
  customerPAN: string;
  customerAadhar: string;
  fromDate: string;
  toDate: string;
}

export interface AddVehicleFormData {
  photos: string[];
  name: string;
  model: string;
  type: 'bike' | 'car';
  availability: 'available' | 'rented';
  manufacturingYear: number;
  rate: number;
}

export interface UpdateRentalFormData {
  customerName: string;
  customerNumber: string;
  customerPAN: string;
  customerAadhar: string;
  fromDate: string;
  toDate: string;
  totalPaid: number;
  totalDue: number;
}

// Forgot Password Types
export interface ForgotPasswordPhoneData {
  mobileNumber: string;
}

export interface ForgotPasswordOTPData {
  mobileNumber: string;
  otp: string;
}

export interface ForgotPasswordResetData {
  mobileNumber: string;
  newPassword: string;
  retypeNewPassword: string;
}

export interface UpdateUserPasswordData {
  mobileNumber: string;
  newPassword: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

// Session Storage Types
export interface SessionData {
  userId: string;
  username: string;
  products: ProductsResponse;
} 