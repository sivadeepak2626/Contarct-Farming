# FarmContract - Contract Farming Management System

**A Full-Stack Enterprise MERN Web Application for Third-Year Computer Science Engineering (CSE)**

---

## 1. Project Overview

**FarmContract** is an enterprise-grade contract farming management system that establishes a transparent, audited, and legally structured digital bridge connecting **Farmers (Producers)**, **Corporate Agribusiness Buyers**, and **Agricultural Field Extension Officers** under an overarching **Administrator** oversight.

The system enforces national contract farming regulatory frameworks by automating:
- Tripartite contract formulation with guaranteed buyout pricing and automated valuation.
- Chronological crop cultivation tracking with progress milestone monitoring.
- On-site agronomic inspections, disease diagnosis, and input requirement alerts.
- Quality-graded harvest batch intake with accepted vs. rejected yield tracking.
- Warehouse receipt verification and quota fulfillment tracking.
- Financial settlement reconciliation including itemized deductions, net payable calculations, bank disbursals (NEFT/RTGS), and printable invoices.

---

## 2. Technology Stack

### Frontend
- **React.js 19** with TypeScript
- **React Router v7** for single-page client routing and role-protected layouts
- **Tailwind CSS v4** for clean agricultural theme palette (Forest Green `#1b4332`, Sage Green `#52b788`, off-white canvas `#fbfbf8`)
- **Lucide React** for clean functional interface iconography
- **Axios** with Bearer JWT interceptors for backend REST API communication
- **Recharts** for lifecycle charts, crop-wise volume distributions, and harvest quality metrics

### Backend
- **Node.js** & **Express.js** RESTful API engine
- **JWT (JSON Web Token)** authentication & role-based access control (RBAC) middleware
- **Bcryptjs** for salted password hashing
- **Server-side validation** preventing negative numbers, over-deliveries, and duplicate transactions

### Database & Models
- **MongoDB** with **Mongoose** Object Data Modeling (ODM)
- Fully typed schemas with indexes, timestamps, and relationships across:
  - `User`, `Farmer`, `Buyer`, `FieldOfficer`, `Crop`, `CultivationRecord`, `Contract`, `FieldVisit`, `InputIssue`, `Harvest`, `Delivery`, `Settlement`, `PaymentTransaction`, `Notification`
- Dual persistence architecture: Connects automatically to **MongoDB Atlas** or **local MongoDB** when `MONGODB_URI` is provided, and includes a built-in persistent storage engine initialized with rich Indian agricultural demo data so the app runs smoothly out of the box.

---

## 3. Four User Personas & Demo Accounts

For demonstration and viva evaluation, 1-click login buttons are provided on the login page.

| Role | Name & Entity | Demo Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Rajesh Sharma (Director) | `admin@farmcontract.in` | `Admin@123` | Full system control, user registration, contract approval, global audits, all financial payouts. |
| **Farmer** | Ramesh Patel (`FARM-001`) | `farmer@farmcontract.in` | `Farmer@123` | View assigned contracts, cultivation progress, request farm inputs, view field visits, track payments. |
| **Buyer** | Vikram Malhotra (`AgroCorp`) | `buyer@farmcontract.in` | `Buyer@123` | Create buy contracts, monitor supplier fulfillment, record deliveries, review settlements. |
| **Field Officer** | Dr. Priya Rao (`FO-001`) | `officer@farmcontract.in` | `Officer@123` | Agronomic field logs, disease monitoring, input issue resolution, pre-harvest clearance. |

---

## 4. Key Mathematical Formulations Enforced

1. **Gross Contract Value**:
   $$\text{Gross Contract Value} = \text{Agreed Quantity} \times \text{Agreed Price Per Unit}$$
   *Example:* $1,000\text{ kg} \times ₹30/\text{kg} = ₹30,000$

2. **Remaining Delivery Quota**:
   $$\text{Remaining To Deliver} = \max(0, \text{Agreed Quantity} - \sum \text{Accepted Delivered Quantity})$$
   *Example:* $1,000\text{ kg} - 600\text{ kg} = 400\text{ kg remaining}$

3. **Gross Settlement Amount**:
   $$\text{Gross Settlement} = \text{Accepted Delivered Quantity} \times \text{Agreed Unit Price}$$
   *Example:* $600\text{ kg} \times ₹30/\text{kg} = ₹18,000$

4. **Net Payable Amount**:
   $$\text{Net Payable} = \text{Gross Settlement} - \text{Authorized Deductions} + \text{Adjustments}$$
   *Example:* $₹18,000 - ₹1,000\text{ (moisture fee)} = ₹17,000$

5. **Outstanding Balance**:
   $$\text{Outstanding Balance} = \text{Net Payable} - \sum \text{Recorded Payments}$$
   *Example:* $₹17,000 - ₹10,000\text{ (NEFT payment)} = ₹7,000\text{ balance due}$

---

## 5. End-to-End Acceptance Test Workflow

You can verify the complete project scenario requested in the project brief:

1. **Log in as Admin** using `admin@farmcontract.in` / `Admin@123` (or click the 1-Click Admin demo button).
2. **Register a Farmer**, **Buyer**, and **Field Officer** from their respective management pages.
3. **Navigate to Contracts** and click **Create New Contract**:
   - Farmer: Ramesh Patel (`FARM-001`)
   - Crop: Paddy (Basmati 1121)
   - Agreed Quantity: `1000` kg
   - Agreed Price: `₹30` per kg
   - **Observe**: Gross Contract Value automatically calculates to **₹30,000**.
4. **Assign Field Officer** Dr. Priya Rao (`FO-001`) to the contract.
5. **Log a Field Visit** under Field Visits and **Report an Input Issue** under Input Issues.
6. **Record a Harvest Entry** under Harvests:
   - Enter `800` kg actual yield (`760` kg accepted, `40` kg rejected).
7. **Record an Accepted Delivery** under Deliveries:
   - Enter `600` kg delivered and accepted at AgroCorp Central Silo.
   - **Observe**: Remaining delivery quota is verified as **400 kg**.
8. **Prepare a Settlement** under Settlements:
   - Total accepted quantity: `600` kg.
   - **Observe**: Gross settlement amount calculated as **₹18,000** ($600 \times 30$).
   - Apply an authorized deduction of **₹1,000** (Reason: Moisture conditioning charge).
   - **Observe**: Net payable amount is **₹17,000**.
9. **Record a Payment** under Settlements:
   - Disburse **₹10,000** via NEFT (Ref: `NEFT-HDFC-9988220145`).
   - **Observe**: Outstanding balance immediately updates to **₹7,000**.
10. **Open Printable Statement / Invoice** to view and print the official audit receipt.
11. **Switch Roles** using the top-bar dropdown to Farmer (`farmer@farmcontract.in`) and Buyer (`buyer@farmcontract.in`) to verify strict role-based data visibility.

---

## 6. How to Run Locally with MongoDB

### Prerequisites
- Node.js (v18 or v20+)
- MongoDB Atlas account (free M0 tier) OR local MongoDB Community Server running at `mongodb://127.0.0.1:27017`

### Step 1: Clone and Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your MongoDB connection string:
```env
PORT=3000
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/farmcontract?retryWrites=true&w=majority"
JWT_SECRET="farmcontract-dev-secret-key-change-in-production-2026"
```

### Step 2: Seed the Database
Populate your MongoDB database with initial Indian agricultural data (farmers, buyers, officers, crops, contracts, visits, harvests, deliveries, settlements):
```bash
npm run seed
```

### Step 3: Start the Full-Stack Application
Start the unified full-stack server (runs Express API on port 3000 and mounts Vite development middleware):
```bash
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 7. REST API Endpoints Overview

| Method | Endpoint | Description | Role Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | JWT login with email and password | Public |
| `GET` | `/api/auth/me` | Fetch active user credentials and role | Authenticated |
| `GET` | `/api/dashboard/stats` | Role-specific KPI metrics and chart feeds | Authenticated |
| `GET` | `/api/farmers` | List farmers with filters and pagination | Authenticated |
| `POST` | `/api/farmers` | Register new farmer | Admin, Officer |
| `GET` | `/api/buyers` | List buyer enterprises | Authenticated |
| `POST` | `/api/contracts` | Create tripartite farming contract | Admin, Buyer |
| `PUT` | `/api/contracts/:id/status`| Transition contract lifecycle stage | Admin, Buyer, Farmer |
| `GET` | `/api/cultivation` | List cultivation records and timelines | Authenticated |
| `PUT` | `/api/cultivation/:id/stage`| Advance cultivation growth stage | Admin, Officer, Farmer |
| `POST` | `/api/field-visits` | Log official field officer inspection | Admin, Officer |
| `POST` | `/api/input-issues` | Report seed/fertilizer/pesticide shortage | Authenticated |
| `POST` | `/api/harvests` | Log harvest batch with quality grading | Admin, Officer, Farmer |
| `POST` | `/api/deliveries` | Record warehouse dispatch and receipt | Admin, Farmer, Buyer |
| `POST` | `/api/settlements/prepare`| Calculate and prepare settlement | Admin, Buyer |
| `POST` | `/api/payments/record` | Disburse payment against balance | Admin, Buyer |
| `GET` | `/api/reports?format=csv` | Generate exportable CSV dataset | Authenticated |
| `GET` | `/api/notifications` | Fetch unread system notifications | Authenticated |
| `POST` | `/api/admin/reset-data` | Restore demo seed data for fresh testing | Admin |
