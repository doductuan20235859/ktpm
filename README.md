# 🏢 GreenHome – Hệ thống Quản lý Chung cư Thông minh

GreenHome là một hệ thống quản lý vận hành chung cư dựa trên nền tảng Web, giúp Ban quản lý kiểm soát dữ liệu tập trung và hỗ trợ cư dân tương tác thuận tiện, minh bạch và hiệu quả.

Hệ thống được xây dựng theo mô hình Client – Server, kiến trúc module hóa, dễ mở rộng và bảo trì.

---

## 🚀 Tính năng chính

### 👨‍💼 Dành cho Ban quản lý (Admin)

- Quản trị hệ thống  
  - Phân quyền tài khoản (Admin / Cư dân)  
  - Quản lý cấu hình tòa nhà  

- Quản lý cư dân & căn hộ  
  - Số hóa hồ sơ cư dân (Tenants)  
  - Quản lý thông tin căn hộ (Apartments)  
  - Quản lý phương tiện (Vehicles)  

- Quản lý tài chính  
  - Chốt chỉ số điện, nước hàng tháng  
  - Tự động tính toán và phát hành hóa đơn  

- Theo dõi vận hành  
  - Dashboard thống kê thời gian thực:  
    - Mật độ cư dân  
    - Tình trạng phòng trống  
    - Doanh thu  

- Xử lý phản ánh (Kanban)  
  - Tiếp nhận yêu cầu/báo hỏng từ cư dân  
  - Theo dõi tiến độ xử lý bằng bảng Kanban  

---

### 👨‍👩‍👧‍👦 Dành cho Cư dân

- Cổng thông tin cá nhân  
  - Tra cứu công nợ  
  - Xem lịch sử hóa đơn  

- Gửi phản ánh  
  - Báo cáo sự cố điện, nước, an ninh  
  - Đính kèm hình ảnh hiện trường  

- Đặt lịch tiện ích  
  - Gym  
  - Bể bơi  
  - Sân Tennis  

---

## 🛠 Công nghệ sử dụng

| Thành phần | Công nghệ |
|-----------|----------|
| Frontend | Next.js 14+ (App Router), Tailwind CSS, TypeScript |
| Backend | NestJS, TypeORM |
| Database | PostgreSQL |
| Authentication | JWT (JSON Web Token) |
| Tools | Git, Postman, pgAdmin 4 / DBeaver |

---

## 📂 Cấu trúc dự án

```plaintext
├── backend/               # Backend NestJS
│   ├── src/
│   │   ├── modules/       # Auth, Users, Apartments, Invoices, Requests...
│   │   ├── entities/      # TypeORM Entities
│   │   └── common/        # Guards, decorators, utils
│
├── frontend/              # Frontend Next.js
│   ├── app/               # App Router (auth, admin, resident)
│   ├── components/        # Reusable UI components
│   └── public/            # Assets, images
│
└── database/
    └── ktpm.sql            # Database schema & mock data
⚙️ Cài đặt và chạy dự án
🔧 Yêu cầu hệ thống

Node.js v18 LTS trở lên

PostgreSQL v15 trở lên

🗄️ Thiết lập cơ sở dữ liệu

Tạo database ktpm trong PostgreSQL

Import file database/ktpm.sql

🖥️ Chạy Backend
cd backend
npm install


Tạo file .env:

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=ktpm


Chạy server:

npm run start:dev

🌐 Chạy Frontend
cd frontend
npm install
npm run dev


Truy cập:
http://localhost:3000

📝 Tài khoản dùng thử
Vai trò	Số điện thoại	Mật khẩu
Admin	0901000001	123456
Cư dân	0988333444	123456
👥 Nhóm thực hiện (Nhóm 16)

Võ Huy Hoàng – Thu phí & Hóa đơn

Lê Quang Lợi – Quản lý Dân cư & File

Đỗ Đức Tuân

Đặng Hoàng Minh

Đặng Xuân Khải

🎓 Thông tin học phần

Học phần: Kỹ thuật phần mềm (IT4082)

Trường: Đại học Bách Khoa Hà Nội
