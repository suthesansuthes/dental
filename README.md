# 🦷 Dental Clinic Booking System

A complete full-stack web application for managing dental clinic appointments with role-based access for patients and administrators.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

## ✨ Features

### Patient Features
- ✅ User registration and authentication
- ✅ Browse doctors by specialization
- ✅ View doctor profiles and availability
- ✅ Book appointments with available time slots
- ✅ View appointment history
- ✅ Cancel appointments
- ✅ Receive email confirmations
- ✅ Responsive design for mobile and desktop

### Admin Features
- ✅ Secure admin login
- ✅ Dashboard with statistics
- ✅ Manage doctors (Create, Read, Update, Delete)
- ✅ Upload doctor images to Cloudinary
- ✅ Create and manage time slots
- ✅ Bulk slot creation for multiple days
- ✅ View all appointments
- ✅ Confirm or cancel appointments
- ✅ Block specific dates or time slots
- ✅ Email notifications for status updates

### System Features
- ✅ JWT-based authentication
- ✅ Role-based authorization (Patient/Admin)
- ✅ Prevent double booking
- ✅ Email notifications via Nodemailer
- ✅ Image upload to Cloudinary
- ✅ RESTful API architecture
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ MongoDB aggregation for statistics

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Image Storage**: Cloudinary
- **File Upload**: Multer
- **Email**: Nodemailer
- **Validation**: express-validator

### Frontend
- **Framework**: React.js 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Icons**: Lucide React

## 📁 Project Structure

```
dental-clinic-booking/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── cloudinary.js         # Cloudinary configuration
│   │   └── email.js              # Nodemailer setup
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── doctorController.js   # Doctor CRUD operations
│   │   ├── slotController.js     # Slot management
│   │   └── appointmentController.js # Appointment booking
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── errorHandler.js       # Error handling
│   │   └── validation.js         # Input validation
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Doctor.js             # Doctor schema
│   │   ├── Slot.js               # Slot schema
│   │   └── Appointment.js        # Appointment schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── doctorRoutes.js       # Doctor endpoints
│   │   ├── slotRoutes.js         # Slot endpoints
│   │   └── appointmentRoutes.js  # Appointment endpoints
│   ├── .env.example              # Environment template
│   ├── server.js                 # Express server
│   ├── seedAdmin.js              # Admin seeding script
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.jsx  # Route protection
    │   ├── context/
    │   │   └── AuthContext.jsx     # Auth state management
    │   ├── pages/
    │   │   ├── Home.jsx            # Landing page
    │   │   ├── Login.jsx           # Patient login
    │   │   ├── Register.jsx        # Patient registration
    │   │   ├── AdminLogin.jsx      # Admin login
    │   │   ├── DoctorsList.jsx     # Browse doctors
    │   │   ├── patient/
    │   │   │   ├── Dashboard.jsx   # Patient dashboard
    │   │   │   ├── BookAppointment.jsx # Booking flow
    │   │   │   └── MyAppointments.jsx  # Appointment history
    │   │   └── admin/
    │   │       ├── Dashboard.jsx   # Admin dashboard
    │   │       ├── ManageDoctors.jsx  # Doctor management
    │   │       ├── ManageSlots.jsx    # Slot management
    │   │       └── ManageAppointments.jsx # Appointment management
    │   ├── services/
    │   │   └── api.js              # API service layer
    │   ├── App.jsx                 # Main app component
    │   ├── main.jsx                # React entry point
    │   └── index.css               # Global styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Cloudinary account
- Gmail account (for email notifications)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd dental-clinic-booking
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=Dental Clinic <noreply@dentalclinic.com>
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@dentalclinic.com
ADMIN_PASSWORD=Admin@123
```

### Step 3: Seed Admin User

```bash
node seedAdmin.js
```

This creates the default admin account. **Change the password after first login!**

### Step 4: Frontend Setup

```bash
cd ../frontend
npm install
```

## ⚙️ Environment Variables

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT signing | Min 32 characters |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From Cloudinary dashboard |
| `EMAIL_USER` | Gmail address | `your@gmail.com` |
| `EMAIL_PASSWORD` | Gmail app password | 16-character app password |
| `ADMIN_EMAIL` | Default admin email | `admin@dentalclinic.com` |
| `ADMIN_PASSWORD` | Default admin password | Strong password |

### Getting Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings > Security
3. Click on "App passwords"
4. Generate a new app password for "Mail"
5. Use the 16-character password in `.env`

### MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP or use `0.0.0.0/0` (allow from anywhere)
5. Get connection string from "Connect" button
6. Replace `<password>` with your database user password

### Cloudinary Setup

1. Create account at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Add to `.env` file

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:3000`

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📡 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          - Register new patient
POST   /api/auth/login             - Patient login
POST   /api/auth/admin/login       - Admin login
GET    /api/auth/me                - Get current user
PUT    /api/auth/profile           - Update profile
PUT    /api/auth/change-password   - Change password
```

### Doctor Endpoints

```
GET    /api/doctors                 - Get all doctors (Public)
GET    /api/doctors/:id             - Get doctor by ID (Public)
POST   /api/doctors                 - Create doctor (Admin)
PUT    /api/doctors/:id             - Update doctor (Admin)
DELETE /api/doctors/:id             - Delete doctor (Admin)
GET    /api/doctors/:id/stats       - Get doctor statistics (Admin)
GET    /api/doctors/specializations/list - Get specializations
```

### Slot Endpoints

```
GET    /api/slots/available/:doctorId    - Get available slots (Public)
POST   /api/slots                        - Create slots (Admin)
POST   /api/slots/bulk-create            - Bulk create slots (Admin)
GET    /api/slots/doctor/:doctorId       - Get doctor slots (Admin)
PUT    /api/slots/:id/block              - Block/unblock slot (Admin)
POST   /api/slots/block-dates            - Block multiple dates (Admin)
DELETE /api/slots/:id                    - Delete slot (Admin)
```

### Appointment Endpoints

```
POST   /api/appointments                 - Book appointment (Patient)
GET    /api/appointments/my-appointments - Get patient appointments (Patient)
GET    /api/appointments                 - Get all appointments (Admin)
GET    /api/appointments/:id             - Get appointment by ID
PUT    /api/appointments/:id/confirm     - Confirm appointment (Admin)
PUT    /api/appointments/:id/cancel      - Cancel appointment
PUT    /api/appointments/:id/complete    - Complete appointment (Admin)
GET    /api/appointments/stats/overview  - Get statistics (Admin)
DELETE /api/appointments/:id             - Delete appointment (Admin)
```

### Request Headers

All protected routes require JWT token:

```
Authorization: Bearer <your_jwt_token>
```

## 🚢 Deployment

### Deploy Backend (Railway/Render/Heroku)

1. Create account on deployment platform
2. Create new project
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Deploy Frontend (Vercel/Netlify)

1. Build production version:
   ```bash
   npm run build
   ```

2. Deploy `dist` folder to hosting service

3. Update environment variables:
   - Set `VITE_API_URL` to your backend URL

### Environment Variables for Production

Backend:
- Set `NODE_ENV=production`
- Update `FRONTEND_URL` to your frontend domain
- Use production MongoDB cluster

Frontend:
- Update API base URL in axios configuration

## 📊 Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum['patient', 'admin'],
  phone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Doctor Collection
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  specialization: Enum[...],
  experience: Number,
  qualification: String,
  image: { url: String, publicId: String },
  availableDays: [String],
  consultationFee: Number,
  about: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Slot Collection
```javascript
{
  doctor: ObjectId (ref: Doctor),
  date: Date,
  time: String,
  isBooked: Boolean,
  isBlocked: Boolean,
  appointment: ObjectId (ref: Appointment),
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Collection
```javascript
{
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: Doctor),
  slot: ObjectId (ref: Slot),
  date: Date,
  time: String,
  status: Enum['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
  reason: String,
  notes: String,
  cancelledBy: String,
  cancellationReason: String,
  confirmedAt: Date,
  cancelledAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Usage Guide

### For Patients

1. **Register/Login**: Create account or login
2. **Browse Doctors**: View all available doctors
3. **Select Doctor**: Choose doctor by specialization
4. **Pick Date**: Select appointment date
5. **Choose Time**: Pick available time slot
6. **Confirm**: Review and book appointment
7. **Receive Email**: Get confirmation via email
8. **Manage**: View and cancel appointments if needed

### For Administrators

1. **Login**: Use admin credentials
2. **Dashboard**: View statistics overview
3. **Manage Doctors**: Add, edit, or remove doctors
4. **Create Slots**: Set up availability for doctors
5. **Bulk Slots**: Create slots for multiple days at once
6. **View Appointments**: See all bookings
7. **Confirm/Cancel**: Approve or reject appointments
8. **Block Dates**: Mark unavailable dates

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ✅ Protected routes
- ✅ CORS configuration
- ✅ Error handling middleware
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Check MongoDB URI format
- Verify network access in MongoDB Atlas
- Check database user credentials

**Cloudinary Upload Failed:**
- Verify API credentials
- Check file size limits
- Ensure correct image formats

**Email Not Sending:**
- Use Gmail App Password (not regular password)
- Enable 2FA on Gmail account
- Check firewall settings

**Port Already in Use:**
```bash
# Kill process on port 5000
kill -9 $(lsof -t -i:5000)
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Contributors

Built as a comprehensive MERN stack project for dental clinic management.

## 📧 Support

For issues and questions, please create an issue in the repository.

---

**Default Admin Credentials:**
- Email: `admin@dentalclinic.com`
- Password: `Admin@123`

⚠️ **Important:** Change admin password immediately after first login!
