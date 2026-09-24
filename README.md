# 🌊 DrainWatch — Smart Social Infrastructure & Urban Drainage Surveillance Grid

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Database: Neon PostgreSQL](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?logo=postgresql)](https://neon.tech)
[![Frontend: React + Vite](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react)](https://vitejs.dev)
[![Backend: Node.js + Express](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)](https://nodejs.org)
[![Security: JWT + Bcrypt](https://img.shields.io/badge/Security-JWT%20%2B%20Bcrypt-FF6F00?logo=jsonwebtokens)](https://jwt.io)

**DrainWatch** is an enterprise-grade smart social infrastructure and municipal urban drainage intelligence platform. It bridges citizens, field inspection personnel, drainage engineering specialists, and municipal authorities through real-time waterway telemetry, automated AI hazard risk scoring, geotagged incident tracking, structural risk GIS modeling, and role-based workflows.

---

## 🏛️ System Architecture & 4-Role Ecosystem

DrainWatch enforces **strict role-based dashboard rendering** and separation of duties. Users only access the dedicated dashboard corresponding to their designated role:

```
                                    ┌────────────────────────┐
                                    │    CITIZEN PORTAL      │
                                    │  Lodge Geotagged Issue │
                                    └───────────┬────────────┘
                                                │ (Automated AI Risk Scoring)
                                                ▼
                                    ┌────────────────────────┐
                                    │ FIELD INSPECTOR STATION│
                                    │ On-Site Ground Verify  │
                                    └─────┬────────────┬─────┘
                                          │            │
            (Technical Cases:             │            │ (Surface / Standard Cases)
         Pipes/Culverts/Structural)       │            │
                                          ▼            ▼
                   ┌────────────────────────┐    ┌────────────────────────┐
                   │  DRAINAGE ENGINEERING  │    │   MUNICIPAL OFFICER    │
                   │ • Infrastructure Cause │    │ • Citywide Governance  │
                   │ • Technical Repair Fix │───►│ • Budget Authorization │
                   │ • Cost/Machinery Est.  │    │ • Contractor Dispatch  │
                   │ • Structural Risk GIS  │    │ • Final Resolution     │
                   └────────────────────────┘    └────────────────────────┘
```

---

## 👥 Role Access & Workflow Specifications

### 1. 👤 Citizen (`CitizenDashboard.jsx`)
* **Role**: Community reporters and neighborhood residents.
* **Capabilities**:
  - **3-Step Geotagged Complaint Submission**: Photo upload, browser GPS coordinate auto-detection, hazard categorization, and water depth estimation.
  - **Isolated Private Tracking**: Citizens strictly view and track **only their own submitted incidents**.
  - **Live Progress Stepper**: Real-time visual lifecycle (`Pending Inspection` ➔ `In Progress / Critical Dispatch` ➔ `Inspected` ➔ `Resolved`).
  - **Incident File Lightbox**: View submitted evidence and inspector resolution proof in high resolution.

---

### 2. 👷 Field Inspector (`FieldInspectorDashboard.jsx`)
* **Role**: On-ground municipal verification and field rapid-response personnel.
* **Capabilities**:
  - **Assigned Zone & Ward Filtering**: Focuses on assigned operational sectors (e.g., *Zone 4 - Central Basin / Ward 12*).
  - **On-Ground Verification & Status Transitions**: Mark incidents as *Inspected*, update live progress, and log field findings.
  - **Resolution Proof Submission**: Attach verified after-action photos and technical field notes.
  - **False Alarm Flagging**: Flag duplicates or unfounded reports (*No Water Stagnation*, *Private Property*, etc.).
  - **Upward Escalation**: Escalate major civil damage or heavy obstruction cases to municipal authorities and drainage engineers.

---

### 3. 📡 Drainage Engineer (`DrainageEngineerDashboard.jsx`)
* **Role**: Technical specialist responsible for drainage infrastructure (pipes, culverts, pumping stations, and outfalls).
* **Capabilities**:
  - **Technical Case Queue**: Filterable view of technical cases routed after field inspection (structural collapses, siltation, severe chokes, pump failures).
  - **Infrastructure Root Cause Diagnosis**: Identify root causes (*Undersized Pipe Bottleneck*, *Silt Sedimentation*, *Concrete Culvert Fracture*, *Inverter Trip*).
  - **Technical Repair Specification**: Prescribe engineering solutions (*High-Pressure Hydro Desilting*, *Culvert Reconstruction*, *Pipe Diameter Upgrade 900mm ➔ 1200mm*, *CIPP Trenchless Reline*, *Dual Submersible Pump Retrofit*).
  - **Cost & Material Estimation**: Provide repair budget estimates (INR ₹), required machinery (*Super-Sucker Jetting Rig*, *Excavator*), material specs, and repair timelines.
  - **Structural Risk GIS Tagging**: Flag vulnerability hotspots for the citywide GIS layer and AI flood predictive model.
  - **Upward Submission Governance**: Submits technical recommendations to Municipal Authority for budget sanction; cannot directly alter citizen-facing resolution status.
  - **Live Hydraulic Sensor Network**: Volumetric flow velocity (m³/s), water depth gauges, and pumping station load monitoring.

---

### 4. 🏢 Municipal Officer (`RiskComplaintsVisualizer.jsx`)
* **Role**: Administrative authority overseeing citywide operations, civic triage, and inter-departmental governance.
* **Capabilities**:
  - **Citywide Risk Visualizer & Triage Matrix**: Real-time ranking of all civic incidents by composite risk score, water level, and SLA urgency.
  - **Visual Analytics**: Interactive distribution charts by Criticality Zone and Hazard Category.
  - **Budget Sanction & Contractor Dispatch**: Review drainage engineer cost estimates and dispatch municipal crews.
  - **SLA & Emergency Oversight**: Automated SLA breach countdowns and critical dispatch triggers.

---

## ⚡ Automated AI Risk Scoring Algorithm

DrainWatch calculates a **Location-Aware Weighted Risk Index (0–99)** upon complaint registration:

$$\text{Risk Score} = (W_{\text{cat}} \times 0.40) + (\text{WaterLevel}\% \times 0.25) + ((W_{\text{cat}} \times M_{\text{zone}}) \times 0.35) + B_{\text{landmark}}$$

### Weighted Factors:
* **Category Severity ($W_{\text{cat}}$)**:
  - Culvert Collapse: `92`
  - Toxic Sludge & Overflow: `84`
  - Sump Overflow: `76`
  - Severe Blockage: `66`
  - Open Manhole Hazard: `64`
  - Siltation: `46`
  - Trash Grate Clog: `28`
* **Zone Vulnerability Multipliers ($M_{\text{zone}}$)**:
  - Critical Health Zone / Hospital: `1.45x`
  - School & Educational Zone: `1.35x`
  - High-Traffic Transit / Metro: `1.28x`
  - Dense Commercial Corridor: `1.15x`
  - Residential Area: `1.00x`
  - Public Park: `0.85x`
* **Landmark Proximity Boost ($B_{\text{landmark}}$)**:
  - Automatic keyword & proximity detection adds priority boosts (`+16` Hospital, `+14` School, `+9` Metro).

---

## 🎨 Design System & Aesthetic Tokens

DrainWatch utilizes a custom, high-contrast **Warm Architectural Beige** palette paired with **Deep Navy Blue** command cards and **Water Cyan** telemetry accents:

| Token | Value | Role / Usage |
|---|---|---|
| `--bg-primary` | `#F7F4EE` | Main Canvas (Warm Sand Beige) |
| `--bg-secondary` | `#F0ECE1` / `#E8E2D4` | Card Backgrounds (Ecru / Bone) |
| `--navy-900` | `#0A192F` | Command Panels, Modals, Primary Text |
| `--water-cyan` | `#0284C7` / `#38BDF8` | Telemetry Nodes, Interactive Highlights |
| `--danger-crimson` | `#EF4444` / `#DC2626` | Level 1 Critical Hazard & Hotspots |
| `--warning-amber` | `#F59E0B` / `#D97706` | Field Warning & Moderate Load |
| `--success-emerald` | `#10B981` / `#059669` | Nominal Status & Resolved Issues |

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite, Lucide Icons, Vanilla CSS Design System (Custom Glassmorphism, Responsive Grid, Micro-animations).
* **Backend**: Node.js, Express, CORS, JSON Web Tokens (JWT), Dotenv, Concurrently.
* **Database**: Neon PostgreSQL (`pg` connection pool with SSL) with a transparent, resilient **In-Memory Fallback Engine** for seamless offline development.
* **Authentication**: Dual-identifier login (Email or Mobile Phone Number), Bcrypt password hashing, and 6-digit Mobile OTP verification.

---

## 📂 Project Structure

```
DrainWatch/
├── server/
│   ├── auth.js                      # Authentication, registration, OTP verification, password recovery
│   ├── complaints.js                # Complaints API, AI risk algorithm, field inspection & engineer endpoints
│   ├── db.js                        # Neon PostgreSQL pool, schema initialization, in-memory fallback engine
│   └── index.js                     # Express server configuration & route registration
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx                 # Login, Registration & OTP verification modal
│   │   ├── CitizenComplaintModal.jsx     # Geotagged 3-step incident lodgment modal
│   │   ├── CitizenDashboard.jsx          # Private citizen tracking dashboard & live status stepper
│   │   ├── ComplaintDetailModal.jsx      # Comprehensive incident file & technical assessment lightbox
│   │   ├── Dashboard.jsx                 # Top-level role router, profile banner, and live telemetry
│   │   ├── DrainageEngineerDashboard.jsx # Technical case queue, infrastructure GIS layer & fix recommender
│   │   ├── DrainWatchLogo.jsx            # Dynamic brand mark & badge
│   │   ├── FieldInspectorDashboard.jsx   # Ward-filtered inspection command & resolution logging
│   │   ├── ForgotPasswordModal.jsx       # OTP-based self-service password reset
│   │   ├── OtpVerification.jsx           # 6-digit PIN input with resend cooldown
│   │   └── RiskComplaintsVisualizer.jsx  # Municipal triage matrix, visual analytics & SLA manager
│   ├── App.jsx                           # Auth session verification & root layout
│   ├── index.css                         # CSS design system, typography & animations
│   └── main.jsx                          # React application root
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/JiyaDarshini/DrainWatch.git
cd DrainWatch
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5050
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_drainwatch_secret_jwt_key
```
> **Note**: If `DATABASE_URL` is omitted or unavailable, DrainWatch automatically boots its built-in resilient in-memory database with pre-populated telemetry and sample complaints.

### 4. Start the Application
Run both the Express API and Vite frontend concurrently:
```bash
npm run dev
```

* **Frontend Application**: `http://localhost:5173/`
* **Backend API Gateway**: `http://localhost:5050/`

---

## 📡 REST API Reference

### Authentication & User Management (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user (*Citizen*, *Field Inspector*, *Drainage Engineer*, *Municipal Officer*) |
| `POST` | `/api/auth/login` | Sign in with Email or Phone + Password |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit mobile OTP code and activate profile |
| `POST` | `/api/auth/send-otp` | Resend verification OTP code |
| `POST` | `/api/auth/forgot-password` | Reset password using verified mobile OTP |
| `GET` | `/api/auth/me` | Retrieve authenticated user session and role |

### Incident & Telemetry Intelligence (`/api/complaints`, `/api/telemetry`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/complaints` | Fetch ranked complaints (supports `onlyMine`, `status`, `category`, `zone`, `sortBy`) |
| `GET` | `/api/complaints/analytics` | Aggregate risk tier distribution, zone breakdown, and resolution metrics |
| `POST` | `/api/complaints` | Lodge new incident with automated AI risk index scoring |
| `PATCH` | `/api/complaints/:id/status` | Update administrative status (*Critical Dispatch*, *In Progress*, *Resolved*) |
| `PATCH` | `/api/complaints/:id/field-update` | Log Field Inspector on-ground verification, photo proof, or escalation |
| `PATCH` | `/api/complaints/:id/engineer-assessment` | Submit Drainage Engineer root cause, repair fix, budget estimate & structural risk tag |
| `DELETE` | `/api/complaints/:id` | Delete incident record by numeric ID or complaint code |
| `GET` | `/api/telemetry` | Live waterway depth, volumetric flow velocity, and sump sensor node telemetry |
| `GET` | `/api/system/health` | Health check and database connection status |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
