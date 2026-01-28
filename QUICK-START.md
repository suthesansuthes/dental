# ⚡ Quick Start Guide - Get Running in 10 Minutes

## Step 1: Setup MongoDB (3 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Login
3. Create FREE cluster (M0)
4. Create database user (save password!)
5. Whitelist IP: 0.0.0.0/0
6. Get connection string

## Step 2: Setup Cloudinary (2 minutes)

1. Go to https://cloudinary.com
2. Sign up (free)
3. Copy from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

## Step 3: Setup Gmail (2 minutes)

1. Enable 2FA on your Gmail
2. Go to https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"
4. Copy the 16-character password

## Step 4: Backend Setup (2 minutes)

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add:
- Your MongoDB connection string
- Cloudinary credentials  
- Gmail app password

```bash
node seedAdmin.js
npm run dev
```

✅ Backend running on http://localhost:5000

## Step 5: Frontend Setup (1 minute)

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend running on http://localhost:3000

## Step 6: Login and Test

### Admin Login
- URL: http://localhost:3000/admin/login
- Email: admin@dentalclinic.com
- Password: Admin@123

### Patient Registration
- URL: http://localhost:3000/register
- Create your account
- Browse doctors
- Book appointment

## 🎉 Done!

You now have a fully functional dental clinic booking system running locally.

## Next Steps

1. Change admin password
2. Add doctors from admin panel
3. Create slots for doctors
4. Test booking flow
5. Check email notifications
6. Deploy to production (see DEPLOYMENT.md)

## Troubleshooting

**MongoDB connection failed?**
- Check connection string format
- Verify password is correct
- Ensure IP is whitelisted

**Email not sending?**
- Use App Password (not regular password)
- Verify 2FA is enabled
- Check EMAIL_USER and EMAIL_PASSWORD

**Port already in use?**
```bash
kill -9 $(lsof -t -i:5000)
```

## Need Help?

1. Check README.md - Comprehensive documentation
2. Check DEPLOYMENT.md - Detailed setup guide
3. Check PROJECT-SUMMARY.md - Feature overview

---

**Estimated Total Time: 10 minutes**
**Let's build something awesome! 🚀**
