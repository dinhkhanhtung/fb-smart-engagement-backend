# FB Smart Engagement Pro - Backend Restructure

## Cấu trúc mới của Backend

Backend đã được tái cấu trúc để dễ bảo trì và mở rộng hơn. Dưới đây là cấu trúc mới:

```
backend/
├── config/                 # Cấu hình ứng dụng
│   ├── index.js           # Cấu hình chính
│   └── database.js        # Cấu hình database
├── controllers/           # Logic xử lý business
│   ├── userController.js
│   ├── licenseController.js
│   ├── paymentController.js
│   └── adminController.js
├── models/               # Tương tác với database
│   ├── User.js
│   ├── License.js
│   ├── Payment.js
│   └── Analytics.js
├── routes/               # Định nghĩa API routes
│   ├── userRoutes.js
│   ├── licenseRoutes.js
│   ├── paymentRoutes.js
│   ├── adminRoutes.js
│   └── index.js
├── middleware/           # Middleware functions
│   ├── auth.js
│   └── validation.js
├── utils/                # Utility functions
│   ├── email.js
│   └── helpers.js
├── public/               # Static files
├── server-new.js        # Server chính (mới)
├── server.js            # Server cũ (backup)
└── .env.example         # Environment variables example
```

## Lợi ích của cấu trúc mới

### 1. **Separation of Concerns**
- **Models**: Chỉ xử lý database operations
- **Controllers**: Chỉ xử lý business logic
- **Routes**: Chỉ định nghĩa API endpoints
- **Middleware**: Tái sử dụng authentication và validation

### 2. **Dễ bảo trì**
- Code được tổ chức theo chức năng
- Dễ tìm và sửa lỗi
- Dễ thêm tính năng mới

### 3. **Dễ test**
- Mỗi module có thể test riêng biệt
- Mock dependencies dễ dàng

### 4. **Scalable**
- Dễ thêm controllers, models, routes mới
- Middleware có thể tái sử dụng

## Cách sử dụng

### 1. **Chạy server mới**
```bash
npm start
# hoặc
npm run dev
```

### 2. **Chạy server cũ (backup)**
```bash
npm run start:old
# hoặc
npm run dev:old
```

### 3. **Cấu hình Environment**
Copy `.env.example` thành `.env` và điền thông tin:
```bash
cp .env.example .env
```

## API Endpoints

### User APIs
- `POST /api/users/register` - Đăng ký user
- `GET /api/users/profile/:userId` - Lấy thông tin user
- `POST /api/users/update-active` - Cập nhật last active

### License APIs
- `POST /api/licenses/validate` - Validate license key
- `POST /api/licenses/admin/create` - Tạo license (admin)
- `GET /api/licenses/admin/licenses` - Lấy tất cả licenses (admin)

### Payment APIs
- `POST /api/payments/bank-transfer` - Tạo payment chuyển khoản
- `GET /api/payments/check/:paymentCode` - Kiểm tra trạng thái payment
- `POST /api/payments/admin/verify` - Xác thực payment (admin)

### Admin APIs
- `POST /api/admin/login` - Đăng nhập admin
- `GET /api/admin/analytics` - Thống kê tổng quan
- `GET /api/admin/users` - Lấy danh sách users
- `GET /api/admin/payments` - Lấy danh sách payments
- `GET /api/admin/licenses` - Lấy danh sách licenses

## Migration từ server cũ

1. **Backup server cũ**: `server.js` được giữ nguyên
2. **Server mới**: `server-new.js` với cấu trúc mới
3. **Tương thích**: Tất cả API endpoints giữ nguyên
4. **Database**: Sử dụng cùng database schema

## Lưu ý

- Server cũ vẫn hoạt động bình thường
- Có thể chuyển đổi giữa server cũ và mới
- Tất cả tính năng được giữ nguyên
- Performance được cải thiện nhờ code organization tốt hơn
