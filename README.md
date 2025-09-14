Brightness Web FE

Mã nguồn frontend được khởi tạo bằng Vite + React + TypeScript.

I. Công nghệ
- React 18, TypeScript, Vite

II. Cấu trúc thư mục hiện tại

brightness_web_fe/
- index.html
- vite.config.ts
- package.json
- package-lock.json
- tsconfig.json
- tsconfig.node.json
- .gitignore
- .env
- .env.local
- public/
  - assets/
  - components/
  - layout/
  - pages/
  - styles/
- src/
  - app.tsx               # Component App gốc
  - index.tsx             # Điểm vào ứng dụng
  - assets/
  - components/
    - hooks/
    - layout/
    - ui/
    - utils/
  - config/
  - hooks/
  - layouts/
  - models/
  - pages/
  - routes/
  - services/
  - stores/
    - slices/
    - index.ts
  - themes/
  - utils/

III. Cài đặt và chạy
- Cài đặt: `npm install`
- Chạy dev: `npm run dev`
- Build: `npm run build`
- Xem trước bản build: `npm run preview`

IV. Biến môi trường
- Đặt cấu hình trong `.env` hoặc `.env.local` tại thư mục gốc dự án.

