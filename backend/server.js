const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const validation = require('./middleware/validation');

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

// API Routes

// 1. Sign In
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
      email: user.email
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

// 11. Forgot Password - Verify Phone Number
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

// 12. Forgot Password - Verify OTP
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

// 13. Update User Password
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