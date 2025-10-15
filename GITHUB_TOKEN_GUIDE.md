# 🔑 Hướng dẫn tạo GitHub Personal Access Token

## 📋 Bước 1: Truy cập GitHub Settings
1. Đăng nhập vào GitHub: https://github.com
2. Click vào **avatar** của bạn ở góc phải trên
3. Chọn **Settings**

## 📋 Bước 2: Tìm Developer Settings
1. Cuộn xuống dưới cùng của menu bên trái
2. Click vào **Developer settings**

## 📋 Bước 3: Tạo Personal Access Token
1. Trong **Developer settings**, click **Personal access tokens**
2. Chọn **Tokens (classic)**
3. Click **Generate new token**
4. Chọn **Generate new token (classic)**

## 📋 Bước 4: Cấu hình Token
**Note:** `FB Smart Engagement Pro Backend`

**Expiration:** `90 days` (hoặc No expiration)

**Select scopes:**
- ✅ **repo** (Full control of private repositories)
  - ✅ repo:status
  - ✅ repo_deployment
  - ✅ public_repo
  - ✅ repo:invite
  - ✅ security_events
- ✅ **workflow** (Update GitHub Action workflows)

## 📋 Bước 5: Tạo và Copy Token
1. Click **Generate token**
2. **⚠️ QUAN TRỌNG:** Copy token ngay lập tức (chỉ hiện 1 lần)
3. Lưu token vào file text an toàn

## 📋 Bước 6: Sử dụng Token
```bash
# Trong thư mục backend
git push -u origin main

# Khi được hỏi:
Username: dinhkhanhtung
Password: [Paste token vừa tạo]
```

## 🔒 Bảo mật Token
- **KHÔNG** chia sẻ token với ai
- **KHÔNG** commit token vào code
- Lưu token ở nơi an toàn
- Có thể tạo token mới nếu cần

## 🆘 Nếu quên Token
1. Vào GitHub Settings > Developer settings
2. Personal access tokens > Tokens (classic)
3. Click **Regenerate** hoặc tạo token mới

## 📞 Support
**Email:** dinhkhanhtung@outlook.com  
**Phone:** 0982581222
