# DriveCare PRO — Automotive Mobile & Web App for Vehicle Owner Self-Service

### 🎓 Academic Project Submission
- **Course**: DATABASE SYSTEMS ENGINEERING AND DISTRIBUTED BACKEND DEVELOPMENT (25CS1302E)
- **Institution**: Koneru Lakshmaiah Education Foundation (KLH Hyderabad)
- **Year & Trimester**: Y25 - 2026-2027 Trimester - 4
- **Sec No**: 12 | **Team No**: 18
- **Team Members**:
  - `2520090146` — **P. Bhavan**
  - `2520090135` — **M. Shiva**
  - `2520090115` — **N. Sainathreddy**

---

## 📌 Project Overview
Modern vehicle ownership often involves challenges such as scheduling maintenance, tracking service history, and accessing roadside assistance. **DriveCare PRO** provides a unified, self-service digital ecosystem for vehicle owners and workshop service advisors:
1. **Automated Service Appointments**: Choose vehicle, authorized service center, date & time slot, and request doorstep pickup/drop.
2. **Proactive Maintenance & Health Monitoring**: Live vehicle telemetry gauges (Engine, Transmission, Battery, Brakes, Tyres, Fluids) and warranty/insurance tracking.
3. **Emergency Roadside Assistance (SOS)**: One-touch emergency dispatch for flat tyres, battery jumpstarts, towing, and fuel delivery with live mechanic tracking and ETA countdown.
4. **Digital Invoices & Service History**: Tamper-proof digital records, line-item parts/labor breakdown, 18% GST calculation, online payment simulation, and printable tax receipts.
5. **GPS Service Center Locator**: Interactive hub locator with operating hours, contact numbers, bay occupancy, and real-time availability.
6. **Workshop Advisor Portal**: Dedicated management view for reviewing appointments, updating job card statuses, dispatching roadside rescue units, and analyzing DBMS revenue metrics.

---

## 🏗️ Architecture & Tech Stack

```
DriveCare Full-Stack System
├── Frontend: Modern Responsive Web App (Mobile-first viewport + Desktop dashboard)
│   ├── Lucide Icons, Glassmorphic Automotive Dark Theme, Pure React/JS reactive logic
│   └── Real-time state management with JWT authentication
├── Backend: Node.js & Express.js RESTful API
│   ├── Layered Architecture: Controllers, Routes, Models, Middlewares
│   ├── Security: JWT session authentication, bcryptjs password encryption
│   └── Aggregation Pipelines: DBMS analytics for revenue, bookings, and fleet health
└── Database: MongoDB (Mongoose ODM)
    ├── Local MongoDB running at: mongodb://127.0.0.1:27017/drivecare_db
    └── Collections: users, vehicles, appointments, servicerecords, roadsiderequests, servicecenters, notifications
```

---

## 🚀 How to Run the Project

### Prerequisites
1. **Node.js** (v18 or newer installed)
2. **MongoDB** (Local instance listening on port 27017)

### Quick Start (One Command)
1. Open your terminal / command prompt in the `backend` directory:
   ```bash
   cd "D:\2nd yr Odd_sem\DBMS\Project_DBMS\backend"
   ```
2. Start the full-stack server:
   ```bash
   npm start
   ```
3. Open your browser and visit:
   ```
   http://localhost:5000
   ```

### Seeding Sample Evaluation Data
To reset or re-populate rich realistic demo data into MongoDB:
```bash
npm run seed
```

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password | Features |
| :--- | :--- | :--- | :--- |
| **Vehicle Owner (Customer)** | `shiva@drivecare.com` | `Password@123` | Manage Hyundai Creta & Maruti Swift, book services, trigger SOS, view invoices |
| **Service Advisor (Workshop)** | `advisor@drivecare.com` | `Password@123` | Approve bookings, dispatch tow trucks, generate invoices, DBMS analytics |

*(You can also quickly toggle between accounts using the **⇄ Switch** button on the top right bar of the app!)*

---

## 📊 Database Collections & Schemas

1. **`User`**: Role-based access (`customer`, `advisor`, `admin`), password hashing, loyalty rewards.
2. **`Vehicle`**: Health metrics (`engine`, `battery`, `brakes`, `tyres`, `fluids`), warranty status, insurance & PUC records.
3. **`Appointment`**: Service packages, date/time slots, doorstep pickup toggle, lifecycle tracking (`Pending` $\rightarrow$ `Confirmed` $\rightarrow$ `In-Progress` $\rightarrow$ `Completed`).
4. **`ServiceRecord`**: Historical repairs, itemized parts and labor, GST invoice generator, payment status (`Paid` / `Pending`).
5. **`RoadsideRequest`**: Incident categorization (Flat tyre, Dead battery, Towing), GPS coordinates, technician dispatch, ETA tracking.
6. **`ServiceCenter`**: Location data, bay capacity, operating hours, ratings, direct dial.
7. **`Notification`**: Real-time push reminders for bookings, maintenance due dates, and SOS rescue status.
