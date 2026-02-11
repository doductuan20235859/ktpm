🏢 GreenHome – Hệ thống Quản lý Chung cư Thông minh

GreenHome là một hệ thống quản lý vận hành chung cư dựa trên nền tảng Web, giúp Ban quản lý kiểm soát dữ liệu tập trung và hỗ trợ Cư dân tương tác thuận tiện, minh bạch và hiệu quả.

Dự án được xây dựng theo mô hình Client – Server, kiến trúc module hóa, phù hợp cho mở rộng và bảo trì lâu dài.

🚀 Chức năng chính
👨‍💼 Dành cho Ban quản lý (Admin)

Quản trị hệ thống

Phân quyền tài khoản (Admin / Cư dân)

Quản lý cấu hình tòa nhà

Quản lý cư dân & căn hộ

Số hóa hồ sơ cư dân (Tenants)

Quản lý thông tin căn hộ (Apartments)

Quản lý phương tiện (Vehicles)

Quản lý tài chính

Chốt chỉ số điện, nước hàng tháng

Tự động tính toán và phát hành hóa đơn

Theo dõi vận hành

Dashboard thống kê thời gian thực:

Mật độ cư dân

Tình trạng phòng trống

Doanh thu

Xử lý phản ánh (Kanban)

Tiếp nhận báo hỏng/yêu cầu từ cư dân

Theo dõi tiến độ xử lý bằng bảng Kanban trực quan

👨‍👩‍👧‍👦 Dành cho Cư dân

Cổng thông tin cá nhân

Tra cứu công nợ

Xem lịch sử hóa đơn chi tiết

Gửi phản ánh

Báo cáo sự cố điện, nước, an ninh

Đính kèm hình ảnh hiện trường

Đặt lịch tiện ích

Đăng ký sử dụng các tiện ích chung:

Gym

Bể bơi

Sân Tennis

🛠 Công nghệ sử dụng
Thành phần	Công nghệ
Frontend	Next.js 14+ (App Router), Tailwind CSS, TypeScript
Backend	NestJS, TypeORM
Database	PostgreSQL
Xác thực	JWT (JSON Web Token)
Công cụ	Git, Postman, pgAdmin 4 / DBeaver
📂 Cấu trúc dự án
├── backend/               # Mã nguồn Backend (NestJS)
│   ├── src/
│   │   ├── modules/       # Auth, Users, Apartments, Invoices, Requests...
│   │   ├── entities/      # TypeORM Entities
│   │   └── common/        # Guards, decorators, utils dùng chung
│
├── frontend/              # Mã nguồn Frontend (Next.js)
│   ├── app/               # App Router (auth, admin, resident)
│   ├── components/        # UI components tái sử dụng
│   └── public/            # Assets, images
│
└── database/              # File SQL
    └── ktpm.sql            # Backup dữ liệu & cấu trúc DB

⚙️ Hướng dẫn cài đặt
🔧 Yêu cầu hệ thống

Node.js v18 LTS trở lên

PostgreSQL v15 trở lên

🗄️ Bước 1: Thiết lập Cơ sở dữ liệu

Tạo database mới tên ktpm trong PostgreSQL

Import file ktpm.sql trong thư mục database/ để khởi tạo bảng và dữ liệu mẫu

🖥️ Bước 2: Cấu hình Backend
cd backend
npm install


Tạo file .env và cấu hình:

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=ktpm


Chạy server:

npm run start:dev

🌐 Bước 3: Cấu hình Frontend
cd frontend
npm install
npm run dev


👉 Truy cập ứng dụng tại: http://localhost:3000

📝 Tài khoản dùng thử (Mock Data)
Vai trò	Số điện thoại	Mật khẩu
Admin	0901000001	123456
Cư dân	0988333444	123456
👥 Thành viên thực hiện – Nhóm 16

Võ Huy Hoàng – Lập trình Thu phí & Hóa đơn

Lê Quang Lợi – Lập trình Dân cư & Quản lý file

Đỗ Đức Tuân

Đặng Hoàng Minh

Đặng Xuân Khải

🎓 Thông tin học phần

Dự án được thực hiện cho học phần Kỹ thuật phần mềm (IT4082)
📍 Đại học Bách Khoa Hà Nội
