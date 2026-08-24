# QR Display App

Web app đơn giản để Admin thay một đường link và tất cả người dùng đang mở trang QR sẽ nhận mã QR mới gần như ngay lập tức.

## Chức năng
- Trang công khai hiển thị QR lớn, responsive
- Fullscreen cho TV/máy chiếu
- Admin đăng nhập bằng Supabase Auth
- Dán URL mới + preview QR
- Lưu link mới và cập nhật realtime
- Lịch sử 20 link gần nhất + khôi phục
- Cache QR gần nhất để vẫn hiển thị khi mất mạng
- Chỉ chấp nhận URL http/https

## 1. Tạo Supabase
1. Tạo project tại Supabase.
2. Vào **SQL Editor** và chạy toàn bộ `schema.sql`.
3. Vào **Authentication > Users** và tạo tài khoản Admin bằng email + password.
4. Vào **Project Settings > API** lấy:
   - Project URL
   - anon/public key
5. Mở `js/config.js` và thay 2 giá trị tương ứng.

> Không bao giờ đưa `service_role` key vào frontend.

## 2. Chạy thử local
Do app dùng ES Modules, hãy chạy bằng local web server, ví dụ VS Code Live Server hoặc:

```bash
python3 -m http.server 8080
```

Sau đó mở:
- `http://localhost:8080/`
- `http://localhost:8080/admin.html`

## 3. Đưa lên GitHub Pages
1. Tạo repository mới trên GitHub.
2. Push toàn bộ project lên branch `main`.
3. Vào **Settings > Pages**.
4. Chọn **Deploy from a branch**.
5. Branch: `main`, folder: `/ (root)`.
6. Save.

Trang public sẽ có dạng:
`https://USERNAME.github.io/REPOSITORY/`

Trang Admin:
`https://USERNAME.github.io/REPOSITORY/admin.html`

## Cấu trúc
```text
qr-display-app/
├── index.html
├── admin.html
├── schema.sql
├── README.md
├── css/
│   ├── style.css
│   └── admin.css
└── js/
    ├── config.js
    ├── supabaseClient.js
    ├── app.js
    └── admin.js
```

## Bảo mật
Bản MVP cho phép mọi user đã đăng nhập Supabase được sửa QR. Nếu chỉ có 1 tài khoản Admin thì đây là lựa chọn đơn giản nhất. Nếu sau này có nhiều tài khoản, nên thêm bảng `admins` và policy kiểm tra UID cụ thể.
