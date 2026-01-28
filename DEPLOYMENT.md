# 🚀 Dental Clinic Booking System - Complete Deployment Guide

## Quick Start Guide

### Prerequisites Checklist
- [ ] Node.js v16+ installed
- [ ] MongoDB Atlas account created
- [ ] Cloudinary account created
- [ ] Gmail account with 2FA enabled
- [ ] Git installed

## Part 1: MongoDB Atlas Setup (5 minutes)

### Step 1: Create MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Log in
3. Click "Build a Database"
4. Choose **FREE** tier (M0)
5. Select cloud provider and region (closest to you)
6. Click "Create Cluster"

### Step 2: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `dentaladmin`
5. Auto-generate secure password (save it!)
6. Database User Privileges: **Atlas Admin**
7. Click "Add User"

### Step 3: Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 4: Get Connection String

1. Go to **Database** (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. It looks like: `mongodb+srv://dentaladmin:<password>@cluster0...`
6. Replace `<password>` with your actual password
7. Add database name: `...mongodb.net/dental-clinic?retryWrites=true...`

## Part 2: Cloudinary Setup (3 minutes)

### Step 1: Create Account

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for free account
3. Verify email

### Step 2: Get API Credentials

1. Go to Dashboard
2. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

## Part 3: Gmail App Password Setup (5 minutes)

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"
3. Follow the setup process

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: "Dental Clinic"
5. Click "Generate"
6. **Copy the 16-character password** (you won't see it again!)

## Part 4: Backend Setup (10 minutes)

### Step 1: Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd dental-clinic-booking/backend

# Install dependencies
npm install
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file
nano .env  # or use any text editor
```

**Fill in these values in `.env`:**

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection (from Part 1, Step 4)
MONGODB_URI=mongodb+srv://dentaladmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/dental-clinic?retryWrites=true&w=majority

# JWT Secret (generate strong random string)
JWT_SECRET=dental_clinic_super_secret_key_2024_production_xyz123

# Cloudinary (from Part 2, Step 2)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz

# Gmail (from Part 3, Step 2)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # 16-char app password
EMAIL_FROM=Dental Clinic <noreply@dentalclinic.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@dentalclinic.com
ADMIN_PASSWORD=Admin@123456
```

### Step 3: Create Admin User

```bash
node seedAdmin.js
```

You should see:
```
✅ Admin user created successfully!
📧 Email: admin@dentalclinic.com
🔑 Password: Admin@123456
```

### Step 4: Start Backend

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Backend should be running on `http://localhost:5000`

Test it: Open browser and go to `http://localhost:5000`

## Part 5: Frontend Setup (5 minutes)

### Step 1: Install Dependencies

```bash
# Open new terminal
cd dental-clinic-booking/frontend

# Install dependencies
npm install
```

### Step 2: Start Frontend

```bash
npm run dev
```

Frontend should be running on `http://localhost:3000`

## Part 6: Test the Application (5 minutes)

### Test Patient Flow

1. Open `http://localhost:3000`
2. Click "Get Started" or "Register"
3. Fill in patient registration:
   - Name: Test Patient
   - Email: patient@test.com
   - Phone: +1234567890
   - Password: Test@123
4. Click "Register"
5. You should be logged in and see patient dashboard
6. Browse doctors
7. Try booking an appointment

### Test Admin Flow

1. Open new incognito window
2. Go to `http://localhost:3000/admin/login`
3. Login with:
   - Email: `admin@dentalclinic.com`
   - Password: `Admin@123456`
4. You should see admin dashboard with statistics
5. Try adding a doctor:
   - Name: John Smith
   - Email: john@dental.com
   - Phone: +1234567890
   - Specialization: General Dentistry
   - Experience: 10
   - Qualification: BDS, MDS
   - Fee: 100
6. Create slots for the doctor
7. View appointments

## Part 7: Production Deployment

### Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Node.js
6. Set root directory: `backend`
7. Add all environment variables from `.env`
8. Set `NODE_ENV=production`
9. Deploy
10. Copy the provided URL (e.g., `https://your-app.railway.app`)

### Deploy Frontend to Vercel

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Go to [Vercel](https://vercel.com)
3. Sign up with GitHub
4. Click "New Project"
5. Import your repository
6. Set root directory: `frontend`
7. Set environment variable:
   - `VITE_API_URL`: Your Railway backend URL
8. Deploy
9. You'll get a URL like `https://your-app.vercel.app`

### Update Backend FRONTEND_URL

1. Go back to Railway
2. Add environment variable:
   - `FRONTEND_URL`: Your Vercel URL
3. Redeploy

## Troubleshooting

### MongoDB Connection Failed
```
❌ Error: MongoNetworkError
```
**Solution:**
- Check MongoDB URI is correct
- Verify password doesn't contain special characters (or encode them)
- Ensure IP address is whitelisted (0.0.0.0/0)

### Email Not Sending
```
❌ Email Error
```
**Solution:**
- Verify 2FA is enabled on Gmail
- Use App Password, not regular password
- Check EMAIL_USER and EMAIL_PASSWORD are correct
- Try generating new App Password

### Cloudinary Upload Failed
```
❌ Upload failed
```
**Solution:**
- Verify Cloud Name, API Key, API Secret
- Check file size < 5MB
- Ensure file is an image (jpg, png, webp)

### Port Already in Use
```
❌ EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Kill process on port 5000
kill -9 $(lsof -t -i:5000)

# Or use different port in .env
PORT=5001
```

### Frontend Cannot Connect to Backend
```
❌ Network Error
```
**Solution:**
- Ensure backend is running on port 5000
- Check CORS settings in backend
- Verify proxy in vite.config.js

## Common Commands

### Backend
```bash
# Install dependencies
npm install

# Development mode (auto-reload)
npm run dev

# Production mode
npm start

# Create admin user
node seedAdmin.js
```

### Frontend
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project URLs

### Development
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API Docs: `http://localhost:5000/api`

### Production
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`

## Default Credentials

### Admin
- Email: `admin@dentalclinic.com`
- Password: `Admin@123456`

### Test Patient
- Email: `patient@test.com`
- Password: `Test@123`

**⚠️ IMPORTANT: Change all default passwords in production!**

## Security Checklist

- [ ] Changed admin password
- [ ] Using strong JWT_SECRET (32+ characters)
- [ ] Gmail App Password configured (not regular password)
- [ ] MongoDB user has strong password
- [ ] Environment variables not committed to Git
- [ ] CORS configured for production domain
- [ ] HTTPS enabled in production
- [ ] MongoDB IP whitelist configured properly

## Support

If you encounter issues:

1. Check error messages in terminal
2. Verify environment variables
3. Check MongoDB Atlas cluster status
4. Verify Cloudinary account status
5. Test Gmail App Password

## Next Steps

1. ✅ Complete setup and testing
2. ✅ Add sample doctors and slots
3. ✅ Test complete booking flow
4. ✅ Deploy to production
5. ✅ Share with users
6. 🎉 Celebrate your deployed app!

---

**Estimated Total Setup Time: 30-40 minutes**

Good luck! 🚀
