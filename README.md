# FB Smart Engagement Pro - Backend API

Backend API cho hệ thống quản lý users, payments và licenses của FB Smart Engagement Pro.

## 🚀 Features

- **User Management**: Đăng ký, trial tracking, PRO activation
- **Payment Processing**: Stripe integration, webhook handling
- **License System**: Tạo, validate, quản lý licenses
- **Admin Dashboard**: Quản lý users, payments, analytics
- **Analytics**: Tracking, reporting, insights

## 📦 Installation

### 1. Clone Repository
```bash
git clone https://github.com/dinhkhanhtung/fb-smart-engagement-backend.git
cd fb-smart-engagement-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configuration
```bash
# Copy config example
cp config.example.js config.js

# Edit config.js with your values
nano config.js
```

### 4. Environment Variables
```bash
# Create .env file
touch .env

# Add your environment variables
echo "STRIPE_SECRET_KEY=sk_test_your_key" >> .env
echo "EMAIL_USER=your_email@gmail.com" >> .env
echo "EMAIL_PASS=your_app_password" >> .env
```

## 🛠️ Setup

### 1. Stripe Configuration
1. Tạo tài khoản Stripe
2. Lấy API keys từ Stripe Dashboard
3. Setup webhook endpoint: `https://yourdomain.com/api/webhook/stripe`
4. Cập nhật config.js

### 2. Email Configuration
1. Tạo Gmail App Password
2. Cập nhật EMAIL_USER và EMAIL_PASS
3. Test email sending

### 3. Database Setup
Database sẽ tự động tạo khi chạy server lần đầu.

## 🚀 Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 📡 API Endpoints

### User Management
- `POST /api/register` - Đăng ký user mới
- `POST /api/validate` - Validate license
- `GET /api/user/:id` - Lấy thông tin user

### Payment Processing
- `POST /api/process-payment` - Xử lý thanh toán
- `POST /api/webhook/stripe` - Stripe webhook
- `POST /api/create-license` - Tạo license

### Admin Dashboard
- `GET /api/admin/users` - Danh sách users
- `GET /api/admin/analytics` - Analytics data
- `GET /api/admin/payments` - Payment history
- `GET /api/admin/licenses` - License management

## 🎯 Usage

### 1. Extension Integration
```javascript
// Trong extension
const response = await fetch('https://your-api.com/api/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        licenseKey: userLicenseKey,
        userId: userId,
        deviceId: deviceId
    })
});
```

### 2. Payment Flow
1. User click "Upgrade" trong extension
2. Redirect đến payment page
3. Stripe checkout process
4. Webhook xử lý payment
5. Tạo license và gửi email
6. Extension nhận license và activate PRO

### 3. Admin Dashboard
- Truy cập: `https://yourdomain.com/admin.html`
- Quản lý users, payments, licenses
- Analytics và reporting

## 🔧 Configuration

### Stripe Setup
```javascript
// config.js
stripe: {
    publicKey: 'pk_test_...',
    secretKey: 'sk_test_...',
    webhookSecret: 'whsec_...'
}
```

### Email Setup
```javascript
// config.js
email: {
    service: 'gmail',
    user: 'your_email@gmail.com',
    pass: 'your_app_password'
}
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE,
    device_id VARCHAR(255),
    email VARCHAR(255),
    trial_start DATETIME,
    is_trial BOOLEAN,
    is_pro BOOLEAN,
    plan VARCHAR(50),
    created_at DATETIME
);
```

### Licenses Table
```sql
CREATE TABLE licenses (
    id INTEGER PRIMARY KEY,
    user_id VARCHAR(255),
    license_key VARCHAR(255) UNIQUE,
    plan VARCHAR(50),
    expires_at DATETIME,
    status VARCHAR(50),
    created_at DATETIME
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id INTEGER PRIMARY KEY,
    user_id VARCHAR(255),
    stripe_payment_id VARCHAR(255),
    amount INTEGER,
    currency VARCHAR(10),
    plan VARCHAR(50),
    status VARCHAR(50),
    created_at DATETIME
);
```

## 🚀 Deployment

### 1. Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Heroku Deployment
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set STRIPE_SECRET_KEY=sk_test_...
heroku config:set EMAIL_USER=your_email@gmail.com

# Deploy
git push heroku main
```

### 3. DigitalOcean App Platform
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

## 🔒 Security

- **HTTPS Only**: Tất cả API calls phải qua HTTPS
- **CORS Configuration**: Chỉ cho phép extension domain
- **Rate Limiting**: Giới hạn API calls
- **Input Validation**: Validate tất cả inputs
- **SQL Injection Protection**: Sử dụng parameterized queries

## 📈 Monitoring

### Analytics Tracking
- User registrations
- Trial conversions
- Payment success rates
- License usage
- Error rates

### Logging
- API requests
- Payment events
- License activations
- Error logs

## 🛠️ Development

### Testing
```bash
# Run tests
npm test

# Test payment flow
npm run test:payment

# Test license system
npm run test:license
```

### Debugging
```bash
# Enable debug logs
DEBUG=* npm run dev

# Check database
sqlite3 database.db
.tables
SELECT * FROM users;
```

## 📞 Support

- **Email**: dinhkhanhtung@outlook.com
- **Phone**: 0982581222
- **GitHub Issues**: https://github.com/dinhkhanhtung/fb-smart-engagement-backend/issues
- **Documentation**: https://github.com/dinhkhanhtung/fb-smart-engagement-backend

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 👨‍💻 Author

Phát triển bởi [AppX](https://www.facebook.com/dinhkhanhtung)
