# QR Display App

Web app hiển thị một mã QR công khai. Admin có thể đăng nhập, dán một URL mới và cập nhật mã QR cho tất cả người đang mở trang gần như ngay lập tức.

## Live URLs

- Public QR: `https://bonglaub16.github.io/my-project/`
- Admin: `https://bonglaub16.github.io/my-project/admin.html`
- Repository: `https://github.com/bonglaub16/my-project`

## Chức năng

- Trang QR công khai, responsive, phù hợp TV/máy chiếu
- Fullscreen
- Supabase Realtime cập nhật QR gần như tức thời
- Cache QR gần nhất bằng localStorage khi mất mạng
- Admin đăng nhập bằng Supabase Auth
- Tạo tài khoản Admin lần đầu ngay trên giao diện
- Cơ chế mã thiết lập một lần để nhận quyền Admin
- Dán URL, xem trước QR, lưu và cập nhật
- Lịch sử 20 URL gần nhất và khôi phục nhanh
- Chỉ chấp nhận `http://` và `https://`
- RLS và RPC kiểm tra quyền Admin ở phía database
- GitHub Actions tự động deploy GitHub Pages khi push vào `main`

## Supabase production

Project hiện đã được cấu hình trong `js/config.js` bằng **Project URL** và **publishable key**. Publishable key là loại key dành cho frontend; quyền dữ liệu được bảo vệ bằng Row Level Security.

Không bao giờ đưa `service_role` hoặc secret key vào frontend hay GitHub.

## Khởi tạo Admin lần đầu

1. Mở trang Admin.
2. Nhập email và mật khẩu tối thiểu 8 ký tự.
3. Chọn **Tạo tài khoản Admin lần đầu**.
4. Nếu Supabase yêu cầu xác nhận email, xác nhận email rồi quay lại trang Admin để đăng nhập.
5. Khi được hỏi mã thiết lập Admin một lần, nhập mã do chủ dự án lưu giữ.
6. Sau khi nhận quyền thành công, mã thiết lập bị xóa khỏi database và không thể dùng lần hai.

## Cấu trúc

```text
my-project/
├── index.html
├── admin.html
├── schema.sql
├── README.md
├── css/
│   ├── style.css
│   └── admin.css
├── js/
│   ├── config.js
│   ├── supabaseClient.js
│   ├── app.js
│   └── admin.js
└── .github/
    └── workflows/
        └── pages.yml
```

## Bảo mật

Public chỉ có quyền đọc `qr_config`. Các thao tác cập nhật QR và lịch sử đi qua PostgreSQL functions kiểm tra `auth.uid()` có nằm trong `app_admins` hay không. `app_admins` và `app_settings` không được cấp quyền đọc trực tiếp cho trình duyệt.

Các SECURITY DEFINER RPC được chủ động thiết kế để callable bởi user đã đăng nhập, nhưng mỗi hàm tự kiểm tra quyền hoặc mã bootstrap trước khi thực hiện thay đổi.

## Deploy

Workflow `.github/workflows/pages.yml` được kích hoạt mỗi khi branch `main` thay đổi và deploy site tĩnh lên GitHub Pages.
