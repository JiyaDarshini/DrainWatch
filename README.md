# 🌊 DrainWatch — Smart Social Infrastructure & Urban Drainage Intelligence

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?logo=postgresql)](https://neon.tech)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)](https://vitejs.dev)
[![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)](https://nodejs.org)

**DrainWatch** is a next-generation smart social infrastructure and municipal drainage surveillance platform. It provides real-time waterway telemetry, catchment basin flood risk monitoring, automated mobile OTP verification, and role-based access for citizens, municipal officers, field inspectors, and drainage engineers.

---

## 🎨 Theme & Visual Palette

DrainWatch features a **Warm Architectural Beige** background paired with a **Deep Navy Blue** and **Electric Water Cyan** aesthetic:
- **Primary Canvas**: `#F7F4EE` (Warm Sand Beige)
- **Secondary Surfaces**: `#F0ECE1` / `#E8E2D4` (Ecru/Bone)
- **High-Contrast Cards & CTAs**: `#0A192F` / `#0F223D` (Deep Navy Blue)
- **Telemetry Accents**: `#0284C7` / `#38BDF8` (Water Cyan)

---

## ✨ Key Features

- **🔐 Dual-Mode Authentication**:
  - Sign in using **Email OR Mobile Phone Number** + Password.
  - "Remember Me" credential preservation.
  - "Forgot Password" self-service recovery with verified mobile OTP reset.
- **📱 6-Digit Mobile OTP Verification**:
  - Interactive PIN input with auto-advance and backspace management.
  - 60-second cooldown timer with instant resend.
  - Direct database validation against the `otp_codes` table.
- **👥 Role-Based Registration**:
  - User categories: *Citizen*, *Municipal Officer*, *Field Inspector*, *Drainage Engineer*.
  - Live password strength analyzer and match verification.
- **🐘 Neon PostgreSQL Cloud Integration**:
  - Auto-initializing schemas for `users`, `otp_codes`, and `drainage_alerts`.
  - Secure password hashing with `bcryptjs` and session tokens with `jsonwebtoken`.
- **📊 Live Command Station**:
  - Real-time IoT sensor telemetry, waterway depth gauges, and flow velocity metrics.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide Icons, Custom CSS Design System
- **Backend**: Node.js, Express, CORS, Dotenv, Concurrently
- **Database**: Neon PostgreSQL (`pg` Connection Pool with SSL)
- **Security**: BcryptJS, JSON Web Tokens (JWT)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/JiyaDarshini/DrainWatch.git
cd DrainWatch
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
PORT=5050
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_secret_jwt_key
```

### 4. Run development servers
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173/`
- **Backend API**: `http://localhost:5050/`

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
