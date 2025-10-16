# 🚀 Vercel Deployment Guide

## Cấu hình cho Vercel Deployment

### 1. **Vercel Configuration**
File `vercel.json` đã được cập nhật để sử dụng server mới:
```json
{
    "version": 2,
    "builds": [
        {
            "src": "server-new.js",
            "use": "@vercel/node"
        }
    ],
    "routes": [
        {
            "src": "/(.*)",
            "dest": "/server-new.js"
        }
    ],
    "env": {
        "NODE_ENV": "production"
    }
}
```

### 2. **Environment Variables cho Vercel**

Trong Vercel Dashboard, thêm các environment variables sau:

#### **Required Variables:**
```
NODE_ENV=production
JWT_SECRET=your_strong_jwt_secret_here
ADMIN_EMAIL=dinhkhanhtung@outlook.com
ADMIN_PASSWORD=your_secure_admin_password
```

#### **Email Configuration (Optional):**
```
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### **Bank Configuration (Vietnam):**
```
BANK_ACCOUNT=0982581222
BANK_NAME=Đinh Khánh Tùng
BANK_BRANCH=BIDV
```

#### **Stripe Configuration (Optional):**
```
STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### **Frontend URL:**
```
FRONTEND_URL=https://your-domain.vercel.app
```

### 3. **Deployment Steps**

#### **Option 1: Deploy từ GitHub**
1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import repository từ GitHub
4. Chọn repository: `dinhkhanhtung/fb-smart-engagement-backend`
5. Root Directory: `backend`
6. Build Command: `npm install`
7. Output Directory: `backend`
8. Install Command: `npm install`
9. Add environment variables
10. Deploy!

#### **Option 2: Deploy từ CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd backend
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: fb-smart-engagement-backend
# - Directory: ./
# - Override settings? N
```

### 4. **Post-Deployment Configuration**

#### **Set Environment Variables:**
```bash
vercel env add JWT_SECRET
vercel env add ADMIN_EMAIL
vercel env add ADMIN_PASSWORD
# ... add other variables
```

#### **Redeploy after adding env vars:**
```bash
vercel --prod
```

### 5. **Testing Deployment**

#### **Health Check:**
```
GET https://your-domain.vercel.app/api/health
```

#### **Admin Login:**
```
POST https://your-domain.vercel.app/api/admin/login
{
  "email": "dinhkhanhtung@outlook.com",
  "password": "your_admin_password"
}
```

#### **User Registration:**
```
POST https://your-domain.vercel.app/api/users/register
{
  "userId": "test_user_123",
  "deviceId": "device_123",
  "email": "test@example.com"
}
```

### 6. **Monitoring & Logs**

#### **View Logs:**
```bash
vercel logs
```

#### **View Function Logs:**
```bash
vercel logs --follow
```

### 7. **Custom Domain (Optional)**

1. Trong Vercel Dashboard
2. Go to Project Settings
3. Domains tab
4. Add your custom domain
5. Configure DNS records

### 8. **Troubleshooting**

#### **Common Issues:**

1. **Build Fails:**
   - Check Node.js version (should be 18.x)
   - Verify all dependencies in package.json

2. **Environment Variables:**
   - Ensure all required env vars are set
   - Check variable names (case-sensitive)

3. **Database Issues:**
   - Vercel uses in-memory database
   - Data resets on each deployment
   - Consider external database for production

4. **CORS Issues:**
   - CORS is already configured in server-new.js
   - Check if frontend domain is allowed

### 9. **Production Checklist**

- ✅ Environment variables configured
- ✅ JWT secret is strong and secure
- ✅ Admin credentials are secure
- ✅ Email service configured (if needed)
- ✅ Bank information updated
- ✅ Custom domain configured (optional)
- ✅ SSL certificate active
- ✅ Monitoring set up

### 10. **API Endpoints**

Sau khi deploy, các endpoints sẽ có sẵn:

```
https://your-domain.vercel.app/api/health
https://your-domain.vercel.app/api/users/register
https://your-domain.vercel.app/api/licenses/validate
https://your-domain.vercel.app/api/payments/bank-transfer
https://your-domain.vercel.app/api/admin/login
```

## 🎉 Deployment Complete!

Backend đã được tái cấu trúc và sẵn sàng cho Vercel deployment với:
- ✅ MVC Architecture
- ✅ Modular Code Structure
- ✅ Environment Configuration
- ✅ Vercel Configuration
- ✅ Production Ready
