# 🚀 Hướng dẫn Deploy lên Vercel

## ✅ Đã hoàn thành
- [x] Tái cấu trúc backend với MVC architecture
- [x] Push code lên GitHub repository
- [x] Cập nhật vercel.json cho server mới
- [x] Tạo deployment guide chi tiết

## 🎯 Bước tiếp theo: Deploy lên Vercel

### **Cách 1: Deploy từ Vercel Dashboard (Khuyến nghị)**

1. **Truy cập Vercel Dashboard**
   - Vào [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Đăng nhập bằng GitHub account

2. **Import Project**
   - Click "New Project"
   - Chọn "Import Git Repository"
   - Chọn repository: `dinhkhanhtung/fb-smart-engagement-backend`

3. **Configure Project**
   ```
   Framework Preset: Other
   Root Directory: backend
   Build Command: npm install
   Output Directory: backend
   Install Command: npm install
   ```

4. **Environment Variables**
   Thêm các biến môi trường sau:
   ```
   NODE_ENV=production
   JWT_SECRET=your_strong_jwt_secret_here
   ADMIN_EMAIL=dinhkhanhtung@outlook.com
   ADMIN_PASSWORD=your_secure_password
   BANK_ACCOUNT=0982581222
   BANK_NAME=Đinh Khánh Tùng
   BANK_BRANCH=BIDV
   ```

5. **Deploy**
   - Click "Deploy"
   - Chờ deployment hoàn thành

### **Cách 2: Deploy từ CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd backend
vercel

# Follow prompts:
# Set up and deploy? Y
# Which scope? (chọn account của bạn)
# Link to existing project? N
# Project name: fb-smart-engagement-backend
# Directory: ./
# Override settings? N
```

### **Cách 3: Auto Deploy từ GitHub**

1. **Connect Repository**
   - Vercel sẽ tự động detect changes từ GitHub
   - Mỗi khi push code, Vercel sẽ auto deploy

2. **Branch Settings**
   - Production Branch: `main`
   - Preview Branches: `develop`, `feature/*`

## 🔧 Post-Deployment Configuration

### **1. Set Environment Variables**
```bash
# Nếu dùng CLI
vercel env add JWT_SECRET
vercel env add ADMIN_EMAIL
vercel env add ADMIN_PASSWORD
# ... thêm các biến khác
```

### **2. Test Deployment**
```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Test admin login
curl -X POST https://your-domain.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dinhkhanhtung@outlook.com","password":"your_password"}'
```

### **3. Monitor Logs**
```bash
# View logs
vercel logs

# Follow logs
vercel logs --follow
```

## 📋 Environment Variables Checklist

### **Required Variables:**
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET=strong_secret_key`
- [ ] `ADMIN_EMAIL=dinhkhanhtung@outlook.com`
- [ ] `ADMIN_PASSWORD=secure_password`

### **Optional Variables:**
- [ ] `EMAIL_SERVICE=gmail`
- [ ] `EMAIL_USER=your_email@gmail.com`
- [ ] `EMAIL_PASS=your_app_password`
- [ ] `BANK_ACCOUNT=0982581222`
- [ ] `BANK_NAME=Đinh Khánh Tùng`
- [ ] `BANK_BRANCH=BIDV`
- [ ] `FRONTEND_URL=https://your-domain.vercel.app`

## 🎯 API Endpoints sau khi Deploy

```
https://your-domain.vercel.app/api/health
https://your-domain.vercel.app/api/users/register
https://your-domain.vercel.app/api/licenses/validate
https://your-domain.vercel.app/api/payments/bank-transfer
https://your-domain.vercel.app/api/admin/login
https://your-domain.vercel.app/admin
https://your-domain.vercel.app/download
```

## 🚨 Troubleshooting

### **Build Fails:**
- Kiểm tra Node.js version (18.x)
- Verify dependencies trong package.json
- Check build logs trong Vercel dashboard

### **Runtime Errors:**
- Check function logs
- Verify environment variables
- Test API endpoints

### **Database Issues:**
- Vercel sử dụng in-memory database
- Data sẽ reset mỗi lần deploy
- Cân nhắc external database cho production

## 🎉 Kết quả

Sau khi deploy thành công, bạn sẽ có:
- ✅ Backend API hoạt động trên Vercel
- ✅ Tất cả endpoints sẵn sàng
- ✅ Admin dashboard accessible
- ✅ Auto deployment từ GitHub
- ✅ SSL certificate tự động
- ✅ Global CDN

**Backend đã sẵn sàng cho production!** 🚀
