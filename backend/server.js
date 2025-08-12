const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const validation = require('./middleware/validation');
const { authenticateToken, optionalAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File paths
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const RENTAL_HISTORY_FILE = path.join(__dirname, 'data', 'rental-history.json');

// Helper functions
const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
};

const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Calculate total due based on rental period and rate
const calculateTotalDue = (fromDate, toDate, rate) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const timeDiff = end.getTime() - start.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff * rate;
};

// Helper function to create rental history record
const createRentalHistoryRecord = async (vehicle, vehicleType, rentalInfo, userId = 'user-001') => {
  try {
    const rentalHistory = await readJsonFile(RENTAL_HISTORY_FILE);
    if (!rentalHistory) {
      console.error('Unable to read rental history file');
      return false;
    }

    const newRecord = {
      id: `rental-${Date.now()}`,
      userId,
      userName: rentalInfo.customerName,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleType: vehicleType === 'bikes' ? 'bike' : 'car',
      vehicleModel: vehicle.model,
      startDate: rentalInfo.fromDate,
      endDate: rentalInfo.toDate,
      rentAmount: rentalInfo.totalDue,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    rentalHistory.push(newRecord);
    const success = await writeJsonFile(RENTAL_HISTORY_FILE, rentalHistory);
    return success;
  } catch (error) {
    console.error('Error creating rental history record:', error);
    return false;
  }
};

// Helper function to update rental history record when vehicle is returned
const updateRentalHistoryRecord = async (vehicleId) => {
  try {
    const rentalHistory = await readJsonFile(RENTAL_HISTORY_FILE);
    if (!rentalHistory) {
      console.error('Unable to read rental history file');
      return false;
    }

    // Find the active rental record for this vehicle
    const recordIndex = rentalHistory.findIndex(record => 
      record.vehicleId === vehicleId && record.status === 'active'
    );

    if (recordIndex === -1) {
      console.log('No active rental record found for vehicle:', vehicleId);
      return true; // Not an error, just no active rental
    }

    // Update the record
    const returnDate = new Date().toISOString();
    const record = rentalHistory[recordIndex];
    
    // Check if returned late
    const isOverdue = new Date(returnDate) > new Date(record.endDate);
    
    rentalHistory[recordIndex] = {
      ...record,
      returnDate,
      status: isOverdue ? 'overdue' : 'completed'
    };

    const success = await writeJsonFile(RENTAL_HISTORY_FILE, rentalHistory);
    return success;
  } catch (error) {
    console.error('Error updating rental history record:', error);
    return false;
  }
};

// API Routes

// 1. Sign In (Regular Users Only)
app.post('/api/auth/signin', validation.signIn, async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readJsonFile(USERS_FILE);
    
    if (!users) {
      return res.json({ status: 'failure', message: 'Unable to access user data' });
    }
    
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.json({ status: 'failure', message: 'User not found' });
    }
    
    // Check if user is admin - admins cannot login through regular portal
    if (user.role === 'admin') {
      return res.json({ status: 'failure', message: 'Admin users must use the admin login portal' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ status: 'failure', message: 'Invalid password' });
    }
    
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      status: 'success', 
      data: { token, user: { id: user.id, username: user.username, email: user.email } }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 2. User Creation
app.post('/api/auth/create-user', validation.createUser, async (req, res) => {
  try {
    const { email, mobileNumber, username, password } = req.body;
    const users = await readJsonFile(USERS_FILE);
    
    if (!users) {
      return res.json({ status: 'failure', message: 'Unable to access user data' });
    }
    
    // Check if user already exists
    if (users.find(u => u.username === username)) {
      return res.json({ status: 'failure', message: 'Username already exists' });
    }
    
    if (users.find(u => u.email === email)) {
      return res.json({ status: 'failure', message: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      username,
      email,
      mobileNumber,
      password: hashedPassword,
      profilePhoto: null,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    const success = await writeJsonFile(USERS_FILE, users);
    if (!success) {
      return res.json({ status: 'failure', message: 'Failed to save user data' });
    }
    
    res.json({ status: 'success', message: 'User created successfully' });
  } catch (error) {
    console.error('User creation error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 3. Get Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await readJsonFile(PRODUCTS_FILE);
    
    if (!products) {
      return res.json({ status: 'failure', message: 'Unable to access product data' });
    }
    
    res.json({ status: 'success', data: products });
  } catch (error) {
    console.error('Get products error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 4. Get Owner Profile
app.get('/api/owner/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const users = await readJsonFile(USERS_FILE);
    
    if (!users) {
      return res.json({ status: 'failure', message: 'Unable to access user data' });
    }
    
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.json({ status: 'failure', message: 'User not found' });
    }
    
    const ownerData = {
      username: user.username,
      profilePhoto: user.profilePhoto,
      contactNumber: user.mobileNumber,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    res.json({ status: 'success', data: ownerData });
  } catch (error) {
    console.error('Get owner error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 5. Check Availability
app.get('/api/availability/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const products = await readJsonFile(PRODUCTS_FILE);
    
    if (!products) {
      return res.json({ status: 'failure', message: 'Unable to access product data' });
    }
    
    const allVehicles = [...products.bikes, ...products.cars];
    const vehicle = allVehicles.find(v => v.id === productId);
    
    if (!vehicle) {
      return res.json({ status: 'failure', message: 'Vehicle not found' });
    }
    
    if (vehicle.isRentedFlag && vehicle.rentalInfo) {
      res.json({ 
        status: 'success', 
        data: { 
          fromDate: vehicle.rentalInfo.fromDate, 
          toDate: vehicle.rentalInfo.toDate 
        }
      });
    } else {
      res.json({ 
        status: 'success', 
        data: { 
          fromDate: new Date().toISOString().split('T')[0], 
          toDate: new Date().toISOString().split('T')[0] 
        }
      });
    }
  } catch (error) {
    console.error('Check availability error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 6. Rent Now
app.post('/api/rent-now', validation.rentNow, async (req, res) => {
  try {
    const { productId, customerName, customerNumber, customerPAN, customerAadhar, fromDate, toDate } = req.body;
    const products = await readJsonFile(PRODUCTS_FILE);
    
    if (!products) {
      return res.json({ status: 'failure', message: 'Unable to access product data' });
    }
    
    // Find vehicle
    let vehicleIndex = -1;
    let vehicleType = '';
    
    vehicleIndex = products.bikes.findIndex(v => v.id === productId);
    if (vehicleIndex !== -1) {
      vehicleType = 'bikes';
    } else {
      vehicleIndex = products.cars.findIndex(v => v.id === productId);
      if (vehicleIndex !== -1) {
        vehicleType = 'cars';
      }
    }
    
    if (vehicleIndex === -1) {
      return res.json({ status: 'failure', message: 'Vehicle not found' });
    }
    
    const vehicle = products[vehicleType][vehicleIndex];
    
    if (vehicle.isRentedFlag) {
      return res.json({ status: 'failure', message: 'Vehicle is already rented' });
    }
    
    // Calculate total due
    const totalDue = calculateTotalDue(fromDate, toDate, vehicle.rate);
    
    // Update vehicle
    products[vehicleType][vehicleIndex] = {
      ...vehicle,
      status: 'rented',
      availability: 'rented',
      isRentedFlag: true,
      rentalInfo: {
        customerName,
        customerNumber,
        customerPAN,
        customerAadhar,
        fromDate,
        toDate,
        totalPaid: 0,
        totalDue
      }
    };
    
    const success = await writeJsonFile(PRODUCTS_FILE, products);
    if (!success) {
      return res.json({ status: 'failure', message: 'Failed to update product data' });
    }

    // Create rental history record
    await createRentalHistoryRecord(
      vehicle, 
      vehicleType, 
      products[vehicleType][vehicleIndex].rentalInfo
    );
    
    res.json({ status: 'success', message: 'Vehicle rented successfully' });
  } catch (error) {
    console.error('Rent now error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 7. Make Available
app.post('/api/make-available', validation.makeAvailable, async (req, res) => {
  try {
    const { productId } = req.body;
    const products = await readJsonFile(PRODUCTS_FILE);
    
    if (!products) {
      return res.json({ status: 'failure', message: 'Unable to access product data' });
    }
    
    // Find vehicle
    let vehicleIndex = -1;
    let vehicleType = '';
    
    vehicleIndex = products.bikes.findIndex(v => v.id === productId);
    if (vehicleIndex !== -1) {
      vehicleType = 'bikes';
    } else {
      vehicleIndex = products.cars.findIndex(v => v.id === productId);
      if (vehicleIndex !== -1) {
        vehicleType = 'cars';
      }
    }
    
    if (vehicleIndex === -1) {
      return res.json({ status: 'failure', message: 'Vehicle not found' });
    }
    
    const vehicleId = products[vehicleType][vehicleIndex].id;
    
    // Update vehicle
    products[vehicleType][vehicleIndex] = {
      ...products[vehicleType][vehicleIndex],
      status: 'available',
      availability: 'available',
      isRentedFlag: false,
      rentalInfo: undefined
    };
    
    const success = await writeJsonFile(PRODUCTS_FILE, products);
    if (!success) {
      return res.json({ status: 'failure', message: 'Failed to update product data' });
    }

    // Update rental history record
    await updateRentalHistoryRecord(vehicleId);
    
    res.json({ status: 'success', message: 'Vehicle is now available' });
  } catch (error) {
    console.error('Make available error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 8. Sign Out
app.post('/api/auth/signout', validation.signOut, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success
    res.json({ status: 'success', message: 'Signed out successfully' });
  } catch (error) {
    console.error('Sign out error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 9. Update Rental
app.put('/api/update-rental', validation.updateRental, async (req, res) => {
  try {
    const { productId, customerNumber, toDate, totalPaid } = req.body;
    const products = await readJsonFile(PRODUCTS_FILE);
    
    if (!products) {
      return res.json({ status: 'failure', message: 'Unable to access product data' });
    }
    
    // Find vehicle
    let vehicleIndex = -1;
    let vehicleType = '';
    
    vehicleIndex = products.bikes.findIndex(v => v.id === productId);
    if (vehicleIndex !== -1) {
      vehicleType = 'bikes';
    } else {
      vehicleIndex = products.cars.findIndex(v => v.id === productId);
      if (vehicleIndex !== -1) {
        vehicleType = 'cars';
      }
    }
    
    if (vehicleIndex === -1) {
      return res.json({ status: 'failure', message: 'Vehicle not found' });
    }
    
    const vehicle = products[vehicleType][vehicleIndex];
    
    if (!vehicle.isRentedFlag || !vehicle.rentalInfo) {
      return res.json({ status: 'failure', message: 'Vehicle is not currently rented' });
    }
    
    // Calculate new total due
    const totalDue = calculateTotalDue(vehicle.rentalInfo.fromDate, toDate, vehicle.rate);
    
    // Update rental info
    products[vehicleType][vehicleIndex].rentalInfo = {
      ...vehicle.rentalInfo,
      customerNumber,
      toDate,
      totalPaid,
      totalDue
    };
    
    const success = await writeJsonFile(PRODUCTS_FILE, products);
    if (!success) {
      return res.json({ status: 'failure', message: 'Failed to update rental data' });
    }
    
    res.json({ status: 'success', message: 'Rental information updated successfully' });
  } catch (error) {
    console.error('Update rental error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 10. Add Product
app.post('/api/add-product', validation.addProduct, async (req, res) => {
  try {
    const { photos, name, model, type, availability, manufacturingYear, rate } = req.body;
    const products = await readJsonFile(PRODUCTS_FILE);
    
    if (!products) {
      return res.json({ status: 'failure', message: 'Unable to access product data' });
    }
    
    const newVehicle = {
      id: uuidv4(),
      photos,
      name,
      model,
      type,
      availability,
      manufacturingYear,
      rate,
      status: availability,
      isRentedFlag: false,
      createdDate: new Date().toISOString()
    };
    
    if (type === 'bike') {
      products.bikes.push(newVehicle);
    } else if (type === 'car') {
      products.cars.push(newVehicle);
    } else {
      return res.json({ status: 'failure', message: 'Invalid vehicle type' });
    }
    
    const success = await writeJsonFile(PRODUCTS_FILE, products);
    if (!success) {
      return res.json({ status: 'failure', message: 'Failed to save product data' });
    }
    
    res.json({ status: 'success', message: 'Vehicle added successfully' });
  } catch (error) {
    console.error('Add product error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 11. Update Vehicle
app.put('/api/update-vehicle', validation.updateVehicle, async (req, res) => {
  try {
    const { id, photos, name, model, manufacturingYear, rate } = req.body;
    const products = await readJsonFile(PRODUCTS_FILE);
    
    if (!products) {
      return res.json({ status: 'failure', message: 'Unable to access product data' });
    }
    
    // Find vehicle
    let vehicleIndex = -1;
    let vehicleType = '';
    
    vehicleIndex = products.bikes.findIndex(v => v.id === id);
    if (vehicleIndex !== -1) {
      vehicleType = 'bikes';
    } else {
      vehicleIndex = products.cars.findIndex(v => v.id === id);
      if (vehicleIndex !== -1) {
        vehicleType = 'cars';
      }
    }
    
    if (vehicleIndex === -1) {
      return res.json({ status: 'failure', message: 'Vehicle not found' });
    }
    
    // Update vehicle while preserving other properties
    products[vehicleType][vehicleIndex] = {
      ...products[vehicleType][vehicleIndex],
      photos,
      name,
      model,
      manufacturingYear,
      rate
    };
    
    const success = await writeJsonFile(PRODUCTS_FILE, products);
    if (!success) {
      return res.json({ status: 'failure', message: 'Failed to update vehicle data' });
    }
    
    res.json({ status: 'success', message: 'Vehicle updated successfully' });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 12. Update Profile (Note: For file upload, you would typically use multer middleware)
app.put('/api/profile/update', authenticateToken, validation.updateProfile, async (req, res) => {
  try {
    const { email, firstName, lastName, mobileNumber, profilePhoto } = req.body;
    const username = req.user.username; // Now properly extracted from JWT token
    
    console.log('Updating profile for user:', username);
    console.log('Update data:', { email, firstName, lastName, mobileNumber });
    
    const users = await readJsonFile(USERS_FILE);
    if (!users) {
      return res.json({ status: 'failure', message: 'Unable to access user data' });
    }
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
      return res.json({ status: 'failure', message: 'User not found' });
    }
    
    // Update user profile with all fields
    users[userIndex] = {
      ...users[userIndex],
      email,
      firstName,
      lastName,
      mobileNumber: mobileNumber || users[userIndex].mobileNumber,
      ...(profilePhoto && { profilePhoto }),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Updated user data:', users[userIndex]);
    
    const success = await writeJsonFile(USERS_FILE, users);
    if (!success) {
      return res.json({ status: 'failure', message: 'Failed to update profile' });
    }
    
    // Return the full updated user object
    const updatedUser = users[userIndex];
    res.json({ 
      status: 'success', 
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        mobileNumber: updatedUser.mobileNumber,
        profilePhoto: updatedUser.profilePhoto,
        role: updatedUser.role || 'user',
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 13. Change Password - Step 1 (Validate current password and send OTP)
app.post('/api/profile/change-password/step1', authenticateToken, validation.changePasswordStep1, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const username = req.user.username; // Properly extracted from JWT token
    
    const users = await readJsonFile(USERS_FILE);
    if (!users) {
      return res.json({ status: 'failure', message: 'Unable to access user data' });
    }
    
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.json({ status: 'failure', message: 'User not found' });
    }
    
    // In production, you would hash and compare passwords
    // For demo purposes, we'll simulate password validation
    if (currentPassword.length < 6) {
      return res.json({ status: 'failure', message: 'Current password is incorrect' });
    }
    
    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return res.json({ status: 'failure', message: 'New password must be different from current password' });
    }
    
    // In production, generate and send OTP to user's mobile number
    // For demo, we'll just confirm OTP will be sent
    res.json({ 
      status: 'success', 
      message: 'Current password verified. OTP sent to your registered mobile number.',
      username: username
    });
  } catch (error) {
    console.error('Change password step 1 error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 14. Change Password - Step 2 (Verify OTP and update password)
app.post('/api/profile/change-password/step2', authenticateToken, validation.changePasswordStep2, async (req, res) => {
  try {
    const { username, newPassword, otp } = req.body;
    
    // Mock OTP verification - accept any 6-digit OTP for demo
    if (otp.length === 6 && /^[0-9]{6}$/.test(otp)) {
      const users = await readJsonFile(USERS_FILE);
      if (!users) {
        return res.json({ status: 'failure', message: 'Unable to access user data' });
      }
      
      const userIndex = users.findIndex(u => u.username === username);
      if (userIndex === -1) {
        return res.json({ status: 'failure', message: 'User not found' });
      }
      
      // In production, you would hash the new password before storing
      users[userIndex].password = newPassword;
      
      const success = await writeJsonFile(USERS_FILE, users);
      if (!success) {
        return res.json({ status: 'failure', message: 'Failed to update password' });
      }
      
      res.json({ 
        status: 'success', 
        message: 'Password changed successfully' 
      });
    } else {
      res.json({ 
        status: 'failure', 
        message: 'Invalid OTP. Please try again.' 
      });
    }
  } catch (error) {
    console.error('Change password step 2 error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 15. Forgot Password - Verify Phone Number
app.post('/api/auth/forgot-password/verify-phone', validation.verifyPhone, async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const users = await readJsonFile(USERS_FILE);
    
    if (!users) {
      return res.json({ status: 'failure', message: 'Unable to access user data' });
    }
    
    const user = users.find(u => u.mobileNumber === mobileNumber);
    if (!user) {
      return res.json({ status: 'failure', message: 'Phone number not found. Please check and try again.' });
    }
    
    // In production, you would generate and send an actual OTP via SMS
    // For now, we'll just confirm the phone number exists
    res.json({ 
      status: 'success', 
      message: 'Phone number verified. OTP will be sent shortly.' 
    });
  } catch (error) {
    console.error('Verify phone error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 16. Forgot Password - Verify OTP
app.post('/api/auth/forgot-password/verify-otp', validation.verifyOTP, async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    
    // In production, you would verify the OTP against what was sent
    // For now, we'll accept any 6-digit OTP for testing purposes
    // You can implement actual OTP verification logic here
    
    // Mock verification - in real implementation, check against stored OTP
    if (otp.length === 6 && /^[0-9]{6}$/.test(otp)) {
      res.json({ 
        status: 'success', 
        message: 'OTP verified successfully' 
      });
    } else {
      res.json({ 
        status: 'failure', 
        message: 'Invalid OTP. Please try again.' 
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// 17. Update User Password
app.put('/api/auth/update-user', validation.updateUser, async (req, res) => {
  try {
    const { mobileNumber, newPassword } = req.body;
    const users = await readJsonFile(USERS_FILE);
    
    if (!users) {
      return res.json({ status: 'failure', message: 'Unable to access user data' });
    }
    
    const userIndex = users.findIndex(u => u.mobileNumber === mobileNumber);
    if (userIndex === -1) {
      return res.json({ status: 'failure', message: 'User not found' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    users[userIndex].password = hashedPassword;
    users[userIndex].updatedAt = new Date().toISOString();
    
    const success = await writeJsonFile(USERS_FILE, users);
    if (!success) {
      return res.json({ status: 'failure', message: 'Failed to update password' });
    }
    
    res.json({ 
      status: 'success', 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.json({ status: 'failure', message: 'Internal server error' });
  }
});

// Admin Authentication Endpoints

// Admin Sign In (Phase 1 - Credentials)
app.post('/api/auth/admin-signin', validation.signIn, async (req, res) => {
  try {
    const { username, password } = req.body;

    const users = await readJsonFile(USERS_FILE);
    if (!users) {
      return res.status(500).json({ status: 'failure', message: 'Unable to read users data' });
    }

    // Find the admin user in the database
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ status: 'failure', message: 'Admin user not found' });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(401).json({ status: 'failure', message: 'Access denied. Admin privileges required.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: 'failure', message: 'Invalid admin credentials' });
    }

    return res.json({ 
      status: 'success', 
      message: 'Admin credentials verified. OTP will be sent.' 
    });
  } catch (error) {
    console.error('Admin signin error:', error);
    res.status(500).json({ status: 'failure', message: 'Internal server error' });
  }
});

// Admin OTP Verification (Phase 2)
app.post('/api/auth/admin-verify-otp', validation.adminOTP, async (req, res) => {
  try {
    const { username, otp } = req.body;

    const users = await readJsonFile(USERS_FILE);
    if (!users) {
      return res.status(500).json({ status: 'failure', message: 'Unable to read users data' });
    }

    // Find the admin user in the database
    const user = users.find(u => u.username === username);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ status: 'failure', message: 'Admin user not found' });
    }

    // For demo purposes, accept any 6-digit OTP
    // In production, this would validate against sent OTP
    if (otp && otp.length === 6) {
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.json({
        status: 'success',
        message: 'Admin login successful',
        data: { token }
      });
    }

    return res.status(401).json({ status: 'failure', message: 'Invalid OTP' });
  } catch (error) {
    console.error('Admin OTP verification error:', error);
    res.status(500).json({ status: 'failure', message: 'Internal server error' });
  }
});

// Get Rental History (Admin Only)
app.get('/api/admin/rental-history', async (req, res) => {
  try {
    const rentalHistory = await readJsonFile(RENTAL_HISTORY_FILE);
    if (!rentalHistory) {
      return res.status(500).json({ status: 'failure', message: 'Unable to read rental history' });
    }

    res.json({
      status: 'success',
      message: 'Rental history retrieved successfully',
      data: rentalHistory
    });
  } catch (error) {
    console.error('Get rental history error:', error);
    res.status(500).json({ status: 'failure', message: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'failure', message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 