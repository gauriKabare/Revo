# Vehicle Rental Management System

A modern, full-stack vehicle rental management application built with React, TypeScript, Node.js, and Express.js. Features a clean, responsive UI with modern design and comprehensive rental management capabilities.

## 🚀 Features

### Frontend
- **Modern React App** with TypeScript and responsive design
- **Authentication System** with login and registration
- **Dashboard** with business statistics and quick actions
- **Vehicle Catalogue** with filtering by bikes/cars
- **Vehicle Management** - Add, view, and manage vehicles
- **Rental System** - Complete rental workflow with customer details
- **Profile Management** - User profile and account information
- **Mobile-First Design** - Fully responsive across all devices

### Backend
- **RESTful API** with Express.js
- **Data Validation** using Joi middleware
- **User Authentication** with bcrypt password hashing
- **JSON File Storage** for development (easily replaceable with database)
- **Complete API Endpoints** for all functionality

### Design
- **Modern UI/UX** with minimalistic modern-inspired theme
- **Sass Styling** with organized architecture
- **Component-Based** reusable UI components
- **Purple, Black, White** color palette
- **Smooth Animations** and transitions

## 📱 Pages & Features

1. **Login/Register** - Secure authentication with form validation
2. **Dashboard** - Overview with stats and navigation cards
3. **Profile** - User account information and settings
4. **Catalogue** - Browse vehicles with filtering options
5. **Vehicle Detail** - Detailed view with rental options
6. **Add Vehicle** - Form to add new vehicles to inventory
7. **Vehicles On Rent** - Manage currently rented vehicles
8. **Vehicles Available** - View and rent available vehicles

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- React Router
- Sass/SCSS
- Context API for state management

### Backend
- Node.js
- Express.js
- Joi for validation
- bcryptjs for password hashing
- UUID for unique IDs
- JSON file storage

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vehicle-rental-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the frontend (React) and backend (Express) servers concurrently:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Default Login Credentials

**Admin Account:**
- Username: `admin`
- Password: `password123`

**Test User:**
- Username: `testuser`
- Password: `password123`

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/           # Login and authentication
│   ├── Dashboard/      # Dashboard with stats
│   ├── Profile/        # User profile management
│   ├── Catalogue/      # Vehicle catalogue and details
│   ├── Vehicles/       # Vehicle management pages
│   ├── Layout/         # Navigation and layout
│   └── common/         # Reusable components
├── contexts/           # React Context providers
├── services/           # API service layer
├── styles/             # Sass styling system
└── types/              # TypeScript type definitions

backend/
├── data/               # JSON data files
├── middleware/         # Validation middleware
└── server.js           # Express server
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/create-user` - User registration
- `POST /api/auth/signout` - User logout

### Vehicles
- `GET /api/products` - Get all vehicles
- `POST /api/add-product` - Add new vehicle
- `GET /api/availability/:id` - Check vehicle availability

### Rentals
- `POST /api/rent-now` - Rent a vehicle
- `PUT /api/update-rental` - Update rental information
- `POST /api/make-available` - Return a vehicle

### User
- `GET /api/owner/:username` - Get user profile

## 🎨 Design System

### Colors
- **Primary**: #6B46C1 (Purple)
- **Secondary**: #000000 (Black)
- **Background**: #FFFFFF (White)
- **Success**: #10B981
- **Error**: #EF4444

### Typography
- **Font Family**: Inter
- **Weights**: 300, 400, 500, 600, 700

## 📱 Responsive Design

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔮 Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- Payment gateway integration
- SMS/Email notifications
- Advanced filtering and search
- Reports and analytics
- Multi-language support
- Dark mode theme

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please contact the development team.

---

**Built with ❤️ for modern vehicle rental management**
