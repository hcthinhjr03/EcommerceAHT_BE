# EcomerceAHT_BE

Backend Node.js sử dụng Express.js và MySQL

## Cấu trúc thư mục
- `src/` - mã nguồn chính
  - `routes/` - định nghĩa các route
  - `controllers/` - xử lý logic cho các route
  - `models/` - truy vấn dữ liệu
  - `config/` - cấu hình (ví dụ: kết nối DB)
  - `middlewares/` - các middleware
  - `utils/` - các hàm tiện ích
- `public/` - tài nguyên tĩnh
- `.env` - biến môi trường

## Cài đặt
```bash
npm install
```

## Chạy dự án
```bash
npm run dev
```

## Cấu hình script
Thêm vào `package.json`:
```json
"scripts": {
  "dev": "nodemon src/index.js"
}
```

## Kết nối MySQL
Cấu hình thông tin kết nối trong file `.env`.
