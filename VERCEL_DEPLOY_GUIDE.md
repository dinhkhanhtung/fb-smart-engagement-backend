# 🚀 Vercel Deployment Guide

## 📋 Stripe Keys (Cần cấu hình trong Vercel):

### Secret Key:
```
sk_test_your_stripe_secret_key_here
```

### Publishable Key:
```
pk_test_your_stripe_publishable_key_here
```

## 🎯 Các bước deploy:

### 1. Truy cập Vercel Dashboard
- URL: https://vercel.com/dashboard
- Import project từ GitHub

### 2. Cấu hình Environment Variables
Trong Vercel dashboard, thêm:

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

EMAIL_SERVICE_API_KEY=your_email_key

ADMIN_EMAIL=dinhkhanhtung@outlook.com

ADMIN_PASSWORD=admin123456

NODE_ENV=production
```

### 3. Deploy Settings
- **Framework Preset:** Other
- **Root Directory:** `./backend`
- **Build Command:** `npm run build`
- **Output Directory:** `./`

### 4. Deploy
- Click "Deploy"
- Chờ deployment hoàn thành
- Lấy production URL

## 🔗 Test API sau khi deploy:
```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Test register
curl -X POST https://your-domain.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test123","plan":"monthly"}'
```

## 📞 Support:
**Email:** dinhkhanhtung@outlook.com  
**Phone:** 0982581222
