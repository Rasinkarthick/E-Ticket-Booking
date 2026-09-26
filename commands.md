# E-Ticket Booking Platform — Execution Commands Guide

This document lists all the commands needed to run the **Database**, **Backend Server**, and **Frontend Application**, including Windows PowerShell specifics and one-step startup options.

---

## 📌 Quick Summary of Default Ports & URLs

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MongoDB Default**: `mongodb://127.0.0.1:27017/eticket_db`

---

## 1. Database (MongoDB)

> **💡 Zero-Config Fallback**: The backend includes an automated fallback to an embedded in-memory MongoDB database (`MongoMemoryServer`). Even if you do **not** have MongoDB installed or running, the backend will start immediately without errors!

### Option A: Using Local MongoDB Service (Windows)

#### 1. Check MongoDB Service Status
```powershell
Get-Service -Name MongoDB
```
> **Note**: If the output shows **`Status: Running`**, MongoDB is **already running**! You don't need to do anything further for the database.

#### 2. Start MongoDB Service (Only if Status is "Stopped")
*Note: `net start` requires an elevated terminal. If you see `System error 5: Access is denied`, open PowerShell by right-clicking it and selecting **"Run as Administrator"**.*
```powershell
net start MongoDB
```

#### 3. Stop MongoDB Service (Optional, run as Administrator)
```powershell
net stop MongoDB
```

### Option B: Running MongoDB Manually via CLI
```bash
mongod --dbpath="C:\data\db"
```

---

## 2. Backend Server (Node.js & Express)

### Step 1: Navigate to the backend folder
```powershell
cd "c:\Users\rasin\Desktop\Project\SED\E-Ticket Booking\backend"
```

### Step 2: Install dependencies
```powershell
npm install
```
*(On Windows PowerShell, if you encounter script execution policy restrictions, use `npm.cmd install`)*

### Step 3: Seed initial data (Trains, Passengers, Admin & Tickets)
```powershell
npm run seed
```
or directly:
```powershell
node seed/seeder.js
```

### Step 4: Start the backend server

#### Production Mode
```powershell
npm start
```
or:
```powershell
node server.js
```

#### Development Mode (auto-restart on file changes)
```powershell
npm run dev
```

### Step 5: Verify Backend & Run Test Suite
To verify all 10 core API flows (Auth, Train Search, Availability, Seat Booking, Admin Verification, Admin Ticket Issuance, and Cancellation/Refunds):
```powershell
node test-suite.js
```

---

## 3. Frontend Client (React & Vite)

### Step 1: Open a new terminal and navigate to frontend
```powershell
cd "c:\Users\rasin\Desktop\Project\SED\E-Ticket Booking\frontend"
```

### Step 2: Install dependencies
```powershell
npm install
```
*(or `npm.cmd install`)*

### Step 3: Start the Vite development server
```powershell
npm run dev
```
*(or `npm.cmd run dev`)*

The frontend will be accessible at:
👉 **[http://localhost:3000](http://localhost:3000)**

### Step 4: Build for Production (Optional)
```powershell
npm run build
```

---

## 4. Running Both from Workspace Root

From the root directory (`c:\Users\rasin\Desktop\Project\SED\E-Ticket Booking`):

### Start Backend
```powershell
npm run start:backend
```

### Start Frontend
```powershell
npm run start:frontend
```

---

## 5. Demo Credentials

| Role | Email | Password | Quick Action |
|---|---|---|---|
| **Administrator** | `admin@railway.gov` | `admin123` | Click **"🛡️ Administrator (HQ)"** pill on login screen |
| **Passenger** | `alex@example.com` | `pass123` | Click **"👤 Passenger (Alex)"** pill on login screen |

---

## 6. Windows PowerShell Note (Script Execution Policy)
If Windows gives an error stating `npm : File ... npm.ps1 cannot be loaded because running scripts is disabled`, use `npm.cmd` instead of `npm`, for example:
- `npm.cmd install`
- `npm.cmd start`
- `npm.cmd run dev`
