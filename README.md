# 🌊 DrainWatch — Smart Social Infrastructure & Urban Drainage Intelligence

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?logo=postgresql)](https://neon.tech)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)](https://vitejs.dev)
[![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)](https://nodejs.org)

**DrainWatch** is an enterprise-grade smart social infrastructure and municipal drainage surveillance platform. It bridges citizens and city municipal authorities through real-time waterway telemetry, geotagged hazard reporting, automated risk scoring, mobile OTP verification, and role-based incident triage.

---

## 🎨 Theme & Visual Palette

DrainWatch features a **Warm Architectural Beige** foundation paired with a **Deep Navy Blue** command structure and **Electric Water Cyan** telemetry accents:
- **Primary Canvas**: `#F7F4EE` (Warm Sand Beige)
- **Secondary Surfaces**: `#F0ECE1` / `#E8E2D4` (Ecru/Bone)
- **High-Contrast Command Cards & Modals**: `#0A192F` / `#0F223D` (Deep Navy Blue)
- **Telemetry & Highlight Accents**: `#0284C7` / `#38BDF8` (Water Cyan)
- **Alert Indicators**: `#EF4444` (Critical Red) / `#F59E0B` (Warning Amber) / `#10B981` (Nominal Emerald)

---

## ✨ Key Features

### 👤 Citizen Incident Reporting & Private Tracking
- **📸 3-Step Geotagged Reporting**:
  - **Photo Upload**: Drag-and-drop or file selection with real-time preview (supports photo evidence for municipal crews).
  - **Auto-GPS Location**: One-click browser geolocation fetch with coordinate detection and fallback addresses.
  - **Issue Classification**: Categorize hazards (Culvert Collapse, Toxic Sludge, Sump Overflow, Open Manhole, Severe Blockage, Siltation, Trash Grates) and specify estimated water level.
- **🔒 Isolated User Complaint Visibility**:
  - Citizens only view, track, and manage **their own submitted complaints**.
  - Real-time 4-step progress stepper: *Pending Inspection* ➔ *Critical Dispatch* ➔ *In Progress* ➔ *Resolved*.
  - Personalized **"My Civic Reports"** live counter and filter tabs (*All*, *Active*, *Resolved*).
  - Full-resolution photo lightbox for inspectable incident evidence.

### ⚡ Municipal Risk Scoring Algorithm
- Composite weighted calculation (0–99 score):
  - **45%** Category Hazard Weight (Culvert Collapse = 92, Toxic Sludge = 84, etc.)
  - **30%** Inundation Depth / Water Level Percentage
  - **25%** Zone Vulnerability Factor (Critical Health Zone 1.35x, High Traffic Transit 1.25x, School Zone 1.20x, Commercial 1.10x, Residential 1.00x)
- Automated SLA assignment based on priority (4 hours for Critical, 12 hours for High, 24 hours for Standard).

### 🏛️ Municipal Command Grid & Triage (Officers & Engineers)
- **City-Wide Risk Visualizer**: Sort and rank all city incidents by priority score, water level, remaining SLA hours, or timestamp.
- **Visual Analytics**: Interactive distribution breakdowns by Criticality Zone and Hazard Category.
- **1-Click Triage Status Updates**: Rapidly assign field response units or close resolved issues.

### 🔐 Dual-Mode Authentication & Security
- Sign in with **Email OR Phone Number** + Password.
- **6-Digit Mobile OTP Verification**: PIN auto-advance, backspace navigation, and 60s cooldown timer.
- Self-service **"Forgot Password"** recovery flow via mobile verification.
- Role-based registration: *Citizen*, *Municipal Officer*, *Field Inspector*, *Drainage Engineer*.
- Token-based API authentication (`jsonwebtoken`) with `bcryptjs` password hashing.

### 🛡️ Resilient Database Architecture
- **Neon PostgreSQL Cloud**: Auto-provisioning tables for `users`, `otp_codes`, `drainage_alerts`, and `complaints`.
- **In-Memory Fallback Engine**: Transparent in-memory mock database that operates seamlessly if cloud database credentials are not set during local testing.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide Icons, Vanilla CSS Design System
- **Backend**: Node.js, Express, CORS, Dotenv, Concurrently
- **Database**: Neon PostgreSQL (`pg` Connection Pool with SSL) & In-Memory Resilient Store
- **Security**: BcryptJS, JSON Web Tokens (JWT)

---

## 📂 Project Structure

```
DrainWatch/
├── server/
│   ├── auth.js          # Registration, login, OTP verification, password reset
│   ├── complaints.js    # Risk scoring algorithm, complaint submission, user-isolated queries
│   ├── db.js            # PostgreSQL pool, schema initialization, in-memory mock engine
│   └── index.js         # Express app entrypoint & API route routing
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx                 # Login, Registration & OTP integration
│   │   ├── CitizenComplaintModal.jsx     # Geotagged 3-step complaint creation modal
│   │   ├── CitizenDashboard.jsx          # Private citizen dashboard & live status tracker
│   │   ├── Dashboard.jsx                 # Top-level view switcher & live telemetry table
│   │   ├── DrainWatchLogo.jsx            # SVG brand mark & animated badge
│   │   ├── ForgotPasswordModal.jsx       # OTP-based password reset modal
│   │   ├── OtpVerification.jsx           # 6-digit PIN input with resend cooldown
│   │   └── RiskComplaintsVisualizer.jsx  # Municipal triage command grid & analytics
│   ├── App.jsx                           # Auth state management & root layout
│   ├── index.css                         # Global CSS design tokens & typography
│   └── main.jsx                          # React DOM initialization
├── package.json
└── README.md
```

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
*(Note: If `DATABASE_URL` is omitted, DrainWatch will automatically activate its built-in resilient in-memory database).*

### 4. Run development servers
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173/`
- **Backend API**: `http://localhost:5050/`

---

## 📄 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register user and dispatch mobile OTP |
| `POST` | `/api/auth/login` | Authenticate with Email/Phone + Password |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit OTP code & activate account |
| `POST` | `/api/auth/send-otp` | Resend verification OTP code |
| `POST` | `/api/auth/forgot-password` | Reset password using verified OTP |
| `GET`  | `/api/auth/me` | Fetch authenticated user profile |
| `GET`  | `/api/complaints` | Retrieve complaints (supports `onlyMine=true`, `sortBy`, `status`, `category`) |
| `GET`  | `/api/complaints/analytics`| Retrieve risk tier, zone, and category breakdown statistics |
| `POST` | `/api/complaints` | Lodge new incident with automated risk calculation |
| `PATCH`| `/api/complaints/:id/status` | Update complaint status (*Critical Dispatch*, *In Progress*, *Resolved*) |
| `GET`  | `/api/telemetry` | Live IoT sensor nodes and basin telemetry data |
| `GET`  | `/api/system/health` | System health check and registered user count |

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
