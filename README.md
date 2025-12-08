# Insekta Dashboard
![insekta-dashboard](https://github.com/user-attachments/assets/f52a2bcd-47eb-4b6b-b398-ea4a5062a71c)

## Pendahuluan
Insekta Dashboard adalah aplikasi web berbasis MERN Stack (MongoDB, Express, React, Node.js) yang berfungsi sebagai portal manajemen layanan Pest & Termite Control. 
Aplikasi ini memfasilitasi komunikasi data antara Admin (PT Insekta Fokustama) dan Client (Perusahaan rekanan).

## Live Demo
- Link Website: https://insekta-dashboard-web-app.vercel.app
- Login sebagai admin:
  - Email: unotobio@gmail.com
  - Password: admin12345
- Login sebagai client:
  - Email: juwonoindonesia@gmail.com
  - Password: juwono123

## Tech Stack
### Backend
- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB (via Mongoose ODM)
- Authentication: JWT (JSON Web Token)
- Image Processing: Multer (Memory Storage) + Sharp (Compression/Resize)
- Storage: Cloudinary (CDN untuk Image & Icons)
- Email Service: Nodemailer (SMTP)

### Frontend
- Framework: React.js (Vite)
- Styling: Tailwind CSS + DaisyUI
- State Management: Redux Toolkit (untuk Auth State)
- Routing: React Router DOM v6
- HTTP Client: Axios (dengan Interceptors)
- Icons: React Icons (Feather, Boxicons)
- Notifications: React Hot Toast

## Fitur Utama
### Role & Authentication
- Dashboard Admin: Memiliki akses penuh (CRUD) ke seluruh data.
- Dashboard Client: Hanya memiliki akses "Read-Only" ke data yang di-assign khusus untuk mereka.
- Keamanan:
  - Proteksi Route (Protected Routes).
  - Auto Logout saat sesi habis (Axios Interceptor).
  - Fitur Reset Password aman dengan token hash & expiry time.

### Modul Fitur (Core Features)
- User Management: Admin dapat membuat akun client, menetapkan nama perusahaan, dan reset password.
- Feature Management (Menu Dinamis):
  - Admin dapat membuat menu dashboard custom.
  - Logic Assignment: Menu bisa di-assign ke spesifik client atau grup perusahaan.
  - Mendukung tipe single link atau folder (submenu) dan dapat memuat berbagai jenis link dari mulai spreadsheet, docs, pdf, chart, sampai dengan folder.
- Team Management (Tim Insekta):
  - Daftar teknisi/supervisor.
  - Filter visibilitas: Admin menentukan teknisi mana yang terlihat oleh client tertentu.
- Banner Info & Promo:
  - Slider informasi dengan gambar background dan overlay text.
  - Support link eksternal.
- Kanal Insekta (Web Portal):
  - Menampilkan preview website/dashboard eksternal (via Iframe).
  - Deteksi otomatis website yang memblokir iframe (X-Frame-Options) dengan Fallback UI.
- Data Grafik: Integrasi preview Google Sheet Charts.
- Responsive design di berbagai perangkat (mobile, tablet, desktop)
- Pagination, Lazy Loading, search, filter, sort di beberapa halaman (admin dan client).
- Login dengan role-based authentication.
- Forgot password dan reset password.

## Setup Aplikasi
- buat file .env di dalam folder `server`:
```bash
PORT=5000
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_JWT_SECRET
EMAIL_USER=YOUR_USER_EMAIL
EMAIL_PASS=OUR_APP_PASSWORD_EMAIL
CLIENT_URL=YOUR_CLIENT_URL

CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET

NODE_ENV=development
```

## Screenshot Web App
### Halaman Login
<img width="1915" height="867" alt="image" src="https://github.com/user-attachments/assets/f5109c82-8d29-4b4e-a816-91cc119eefc9" />

### Halaman Forgot Password
<img width="1918" height="865" alt="image" src="https://github.com/user-attachments/assets/b51b93a7-e5bf-4fd9-bc33-6fa7efd53d3a" />

### Halaman Reset Password
<img width="1916" height="862" alt="image" src="https://github.com/user-attachments/assets/3a9e0627-fc45-4c66-a4b8-5d6fe2fedc33" />

### Halaman Dashboard Admin (Dashboard)
<img width="1920" height="1589" alt="image" src="https://github.com/user-attachments/assets/b387bd8e-00a7-4df0-967b-2be9359c40aa" />

### Halaman Dashboard Admin (Feature Management)
<img width="1920" height="1943" alt="image" src="https://github.com/user-attachments/assets/a80b1982-ee25-4b4c-b377-2f79e327f810" />

### Halaman Dashboard Client
<img width="1920" height="2343" alt="image" src="https://github.com/user-attachments/assets/6300a6be-5f68-4b5c-815a-61e4c50936a4" />

## Team Member
- Juwono (https://www.linkedin.com/in/juwono136/)
