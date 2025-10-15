# 🚀 FB Smart Engagement Pro - Backend Deployment Guide

## 📋 Thông tin triển khai

**Repository:** https://github.com/dinhkhanhtung/fb-smart-engagement-backend  
**Email:** dinhkhanhtung@outlook.com  
**Phone:** 0982581222  

## 🔧 Các bước triển khai

### 1. Push code lên GitHub

```bash
# Đã thực hiện:
git init
git add .
git commit -m "Initial commit: FB Smart Engagement Pro Backend API"
git remote add origin https://github.com/dinhkhanhtung/fb-smart-engagement-backend.git
git branch -M main

# Cần thực hiện (cần GitHub authentication):
git push -u origin main
```

### 2. Triển khai lên Vercel

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
2. Import project từ GitHub repository
3. Cấu hình environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `EMAIL_SERVICE_API_KEY`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`

### 3. Cấu hình Stripe

1. Tạo tài khoản [Stripe](https://stripe.com)
2. Lấy API keys từ Stripe Dashboard
3. Cấu hình webhook endpoint: `https://your-domain.vercel.app/api/webhook`

### 4. Cấu hình Email Service

1. Sử dụng SendGrid hoặc Nodemailer
2. Cấu hình SMTP settings
3. Test email functionality

## 📁 Cấu trúc project

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── config.example.js      # Configuration template
├── public/
│   ├── index.html         # Landing page
│   └── admin.html         # Admin dashboard
├── README.md              # Documentation
└── DEPLOYMENT.md          # This file
```

## 🔗 API Endpoints

- `POST /api/register` - User registration
- `POST /api/validate` - License validation
- `POST /api/webhook` - Stripe webhook
- `GET /api/admin` - Admin dashboard

## 🎯 Next Steps

1. Push code lên GitHub (cần GitHub authentication)
2. Deploy lên Vercel
3. Cấu hình Stripe
4. Test payment flow
5. Update extension với production URL

## 📞 Support

**Email:** dinhkhanhtung@outlook.com  
**Phone:** 0982581222  
**GitHub:** https://github.com/dinhkhanhtung/fb-smart-engagement-backend
