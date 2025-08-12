# REVO - Vehicle Rental Management System

A modern, full-stack vehicle rental management platform featuring **clean, minimalistic design** with advanced admin controls, role-based access, and comprehensive rental tracking. Built with React, TypeScript, Node.js, and a professional dark theme with purple accents.

## 🔥 Key Features

### 🚀 **Modern Design & UX**
- **Clean Dark Theme** with professional purple accents and minimalistic design
- **Smooth Animations** and transitions for enhanced user experience
- **Glass Morphism** with backdrop blur and subtle transparency effects
- **Professional Color Palette** - Purple gradients with dark backgrounds
- **Modern Typography** - Inter font family with various weights
- **Mobile-First Responsive** design across all devices

### 🔐 **Advanced Admin System**
- **Two-Factor Authentication** - Admin login with OTP verification (mocked)
- **Role-Based Access Control** - Admin vs. regular user permissions
- **Admin Dashboard** - Comprehensive rental history management
- **Permission-Locked Features** - Make Available buttons locked for non-admin users
- **Admin Navigation** - Exclusive admin-only menu items and features
- **Real-time Admin Badge** - Visual admin status indicator

### 📊 **Comprehensive Rental Management**
- **Automatic Rental Tracking** - Real-time rental history updates
- **Smart Status Management** - Active, completed, and overdue tracking
- **Customer Data Management** - Complete customer information storage
- **Financial Tracking** - Rent amounts, payment status, and due calculations
- **Advanced Filtering** - Filter rentals by status and timeframes
- **Rental Analytics** - Statistics dashboard with key metrics

### 🔒 **Security & Authentication**
- **Secure User Authentication** with bcrypt password hashing
- **Forgot Password System** with phone verification and OTP
- **JWT Token Management** for session handling
- **Input Validation** using Joi middleware
- **Role-based Route Protection**

### 🚗 **Vehicle Management**
- **Complete Vehicle Lifecycle** - Add, rent, return, and manage vehicles
- **Real-time Availability** tracking and updates
- **Photo Management** with carousel displays
- **Vehicle Categories** - Bikes and cars with filtering
- **Rental Information** - Customer details, dates, and payment tracking

## 📱 **Application Pages & Features**

### **Public Pages**
1. **🔐 Login/Register** - Secure authentication with modern UI
2. **🔑 Admin Login** - Two-factor admin authentication with OTP
3. **📱 Forgot Password** - Multi-step password recovery system

### **User Dashboard**
4. **🏠 Dashboard** - Statistics overview with quick actions
5. **👤 Profile** - User account management and information
6. **📋 Catalogue** - Browse vehicles with advanced filtering
7. **🚗 Vehicle Detail** - Comprehensive vehicle information and rental options
8. **➕ Add Vehicle** - Modern form for adding new vehicles
9. **🔄 Vehicles On Rent** - Manage currently rented vehicles
10. **✅ Vehicles Available** - Browse and rent available vehicles

### **Admin-Only Pages**
11. **📊 Rental History** - Complete rental records management with horizontal cards
    - **Filter by Status** - All, Active, Completed, Overdue
    - **Comprehensive Data** - Customer info, vehicle details, dates, amounts
    - **Analytics Dashboard** - Real-time statistics and metrics
    - **Action Management** - View details and follow-up options

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** with TypeScript for type safety
- **React Router** for client-side routing
- **Context API** for global state management
- **SCSS/Sass** with modern mixins and animations
- **Professional Design System** with consistent variables and components

### **Backend**
- **Node.js** with Express.js framework
- **JWT Authentication** for secure sessions
- **Joi Validation** for request validation
- **bcryptjs** for password security
- **UUID** for unique identifier generation
- **JSON File Storage** (easily upgradeable to database)

### **Design & Animation**
- **CSS Animations** - Smooth transitions and hover effects
- **Backdrop Filters** for glass morphism effects
- **Custom SCSS Mixins** for consistent styling
- **Responsive Grid Systems** with CSS Grid and Flexbox
- **Dark Theme Optimized** for professional appearance

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Revo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

   This launches both frontend and backend servers concurrently:
   - **Frontend**: http://localhost:3000
   - **Backend**: http://localhost:5000

### **Default Credentials**

#### **👨‍💼 Admin Access**
- **Username**: `admin`
- **Password**: `Admin@123`
- **OTP**: *Generated dynamically (displayed in UI for testing)*

#### **👤 Test User**
- **Username**: `testuser`
- **Password**: `Test@123`

#### **🔄 Additional Test Users**
You can create new users through the registration system or use the existing users in `backend/data/users.json`

## 📁 **Project Architecture**

```
Revo/
├── src/
│   ├── components/
│   │   ├── Auth/              # Authentication components
│   │   │   ├── Login.tsx      # User login with admin option
│   │   │   ├── AdminLogin.tsx # Two-factor admin authentication
│   │   │   └── ForgotPassword.tsx # Password recovery system
│   │   ├── Admin/             # Admin-only components
│   │   │   └── RentalHistory.tsx # Comprehensive rental management
│   │   ├── Dashboard/         # Main dashboard
│   │   ├── Profile/           # User profile management
│   │   ├── Catalogue/         # Vehicle browsing and details
│   │   ├── Vehicles/          # Vehicle management pages
│   │   ├── Layout/            # Navigation and layout with role-based menu
│   │   └── common/            # Reusable UI components
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication and admin state management
│   ├── services/
│   │   └── api.ts             # API service layer with admin endpoints
│   ├── styles/                # SCSS styling system
│   │   ├── _variables.scss    # Professional theme variables
│   │   ├── _mixins.scss       # Styling mixins and utilities
│   │   └── globals.scss       # Global styles and animations
│   └── types/
│       └── index.ts           # TypeScript definitions including admin types
├── backend/
│   ├── data/
│   │   ├── products.json      # Vehicle inventory
│   │   ├── users.json         # User accounts
│   │   └── rental-history.json # Rental tracking records
│   ├── middleware/
│   │   └── validation.js      # Request validation including admin endpoints
│   └── server.js              # Express server with admin routes
└── public/
    └── index.html             # HTML with modern fonts and meta tags
```

## 🔧 **API Endpoints**

### **🔐 Authentication**
- `POST /api/auth/signin` - Regular user login
- `POST /api/auth/create-user` - User registration
- `POST /api/auth/signout` - User logout
- `POST /api/auth/admin-signin` - Admin credentials verification
- `POST /api/auth/admin-verify-otp` - Admin OTP verification

### **🔑 Password Recovery**
- `POST /api/auth/forgot-password/verify-phone` - Phone number verification
- `POST /api/auth/forgot-password/verify-otp` - OTP verification for password reset
- `PUT /api/auth/update-user` - Update user password

### **🚗 Vehicle Management**
- `GET /api/products` - Get all vehicles with filtering
- `POST /api/add-product` - Add new vehicle to inventory
- `GET /api/availability/:id` - Check specific vehicle availability

### **📋 Rental Operations**
- `POST /api/rent-now` - Process vehicle rental (creates rental history record)
- `PUT /api/update-rental` - Update existing rental information
- `POST /api/make-available` - Return vehicle (updates rental history record)

### **👤 User Management**
- `GET /api/owner/:username` - Get user profile information

### **📊 Admin Operations**
- `GET /api/admin/rental-history` - Get complete rental history (Admin only)

## 🎨 **Professional Design System**

### **🌈 Color Palette**
- **Primary**: #A855F7 (Bright Purple)
- **Secondary**: #8B5CF6 (Medium Purple)
- **Accent**: #C084FC (Light Purple)
- **Background**: #0A0A0A (Deep Black)
- **Surface**: #1A1A1A (Elevated Surface)
- **Text Primary**: #FFFFFF (Pure White)
- **Text Secondary**: #B3B3B3 (Light Gray)
- **Success**: #10B981 (Green)
- **Error**: #EF4444 (Red)
- **Warning**: #F59E0B (Amber)

### **✨ Typography**
- **Font Family**: Inter (All text elements)
- **Font Weights**: 300, 400, 500, 600, 700, 800
- **Monospace**: Courier New (Code and data elements)

### **🔮 Visual Effects**
- **Glass Morphism**: Backdrop blur with semi-transparent backgrounds
- **Smooth Transitions**: 0.3s ease transitions on interactive elements
- **Subtle Shadows**: Multi-layer shadows for depth
- **Gradient Accents**: Purple gradients for highlights
- **Hover Effects**: Transform and glow effects on interaction

### **📱 Responsive Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔒 **Security Features**

### **🛡️ Authentication Security**
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **Role-Based Access**: Admin vs. user permissions
- **Two-Factor Authentication**: Admin OTP verification
- **Input Validation**: Comprehensive Joi validation
- **Phone Verification**: Mock phone number validation system

### **🔐 Admin Security**
- **Separate Admin Login**: Isolated authentication flow
- **OTP Verification**: Second-factor authentication
- **Permission Checking**: Function-level access control
- **Admin-Only Routes**: Protected navigation and endpoints
- **Visual Indicators**: Clear admin status display

## 📊 **Rental History System**

### **📋 Automatic Tracking**
- **Real-time Updates**: Rental records created/updated automatically
- **Status Management**: Active → Completed/Overdue transitions
- **Customer Integration**: Links customer data with rental records
- **Financial Tracking**: Rent amounts and payment status
- **Return Management**: Automatic late return detection

### **📈 Analytics Dashboard**
- **Statistics Cards**: Total, Active, Completed, Overdue counts
- **Filtering System**: Status-based filtering with counts
- **Horizontal Cards**: Comprehensive rental record display
- **Action Management**: View details and follow-up options
- **Date Calculations**: Duration and late return calculations

## 🔮 **Advanced Features**

### **🎭 Role-Based UI**
- **Dynamic Navigation**: Menu items based on user role
- **Button States**: Permission-based enabling/disabling
- **Visual Indicators**: Lock icons for restricted features
- **Admin Badges**: Real-time role display
- **Contextual Actions**: Role-appropriate button sets

### **⚡ Performance Optimizations**
- **Component Memoization**: React.memo and useMemo usage
- **Lazy Loading**: Code splitting for admin components
- **Efficient Re-renders**: Optimized state management
- **SCSS Mixins**: Reusable styling patterns
- **Responsive Images**: Optimized photo loading

## 🚀 **Future Enhancements**

### **🗄️ Database Integration**
- MongoDB or PostgreSQL integration
- Real-time data synchronization
- Advanced querying capabilities
- Data backup and recovery

### **💳 Payment Integration**
- Stripe/PayPal payment processing
- Invoice generation
- Payment history tracking
- Automated billing

### **📱 Mobile App**
- React Native mobile application
- Push notifications
- Offline capability
- Mobile-specific features

### **🔔 Notification System**
- SMS/Email notifications
- Real-time alerts
- Reminder systems
- Admin notifications

### **📊 Advanced Analytics**
- Revenue reporting
- Usage statistics
- Customer insights
- Predictive analytics

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Maintain design system consistency
- Add appropriate role-based access controls
- Include comprehensive error handling
- Write clear commit messages
- Test admin and user flows thoroughly

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🆘 **Support & Documentation**

### **🔧 Troubleshooting**
- Ensure Node.js version 16+
- Check backend server is running on port 5000
- Verify frontend is accessible on port 3000
- Clear browser cache for styling updates

### **📞 Contact**
For support, feature requests, or questions:
- Create an issue on GitHub
- Contact the development team
- Check documentation for common solutions

---

**🌟 Built with modern technology for professional vehicle rental management**

*Featuring a clean, minimalistic design that prioritizes usability and professional appearance.*
