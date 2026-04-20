# cure-ai2
updated cureai with increased features
-----------------------------------------
# CureAI - AI Powered Healthcare Monitoring Platform

CureAI is a full-stack healthcare project where doctors and patients can manage records, upload medical reports, get AI-generated explanations, and view disease-linked organ highlights in a 3D viewer.

## Features

- Role-based access for **Doctor** and **Patient**
- JWT authentication with password hashing (bcrypt)
- Patient lookup by **Aadhaar number** (12-digit validation)
- Medical report upload (`.docx`) with text extraction
- Gemini AI-generated report:
  - summary
  - patient-friendly explanation
  - recommendations
- 3D health visualization with organ highlighting
- Demo-friendly seed script for quick testing

## Tech Stack

- **Frontend:** React (Vite), TailwindCSS, Axios, Three.js / React Three Fiber
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **AI:** Google Gemini API

## Project Structure

```text
.
├── client/   # React frontend
├── server/   # Express backend
└── README.md
```

## Prerequisites

Make sure these are installed before setup:

- Node.js 18+
- npm
- MongoDB (local instance or MongoDB Atlas connection)

## Environment Setup

Create env files from examples:

### 1) Backend env (`server/.env`)

Copy `server/.env.example` -> `server/.env` and set values:

```env
PORT=6000
MONGODB_URI=mongodb://127.0.0.1:27017/cureai
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5175
UPLOAD_DIR=uploads
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### 2) Frontend env (`client/.env`)

Copy `client/.env.example` -> `client/.env` and set values:

```env
VITE_API_BASE_URL=http://localhost:6000
VITE_AI_FITNESS_MONITOR_URL=http://localhost:8501
VITE_BODY_MODEL_URL=
```

> Optional: `VITE_BODY_MODEL_URL` can point to a custom `.glb` body model.

## Steps to Run the Project

Run all commands from the project root.

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Start frontend + backend together

```bash
npm run dev
```

Default URLs:

- Frontend: `http://localhost:5175`
- Backend: `http://localhost:6000`
- Health check: `http://localhost:6000/health`

### 3. (Optional) Seed demo data

```bash
npm run seed
```

This creates:

- one demo doctor account
- one demo patient account (with Aadhaar, disease, medication)

Credentials are printed in terminal output.

## API Overview

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### Patient

- `GET /api/patient/me` (patient only)
- `GET /api/patient/aadhaar/:aadhaarNumber` (doctor only)
- `GET /api/patient/:patientId` (doctor only)
- `PATCH /api/patient/:patientId` (doctor only)

### Reports

- `POST /api/reports/upload` (doctor or patient, multipart/form-data)
- `GET /api/reports/patient/:patientId`
- `POST /api/reports/:reportId/analyze`
- `DELETE /api/reports/:reportId`

## Important Notes

- Aadhaar must be exactly **12 digits** and unique.
- Currently report upload supports **Word `.docx` only**.
- Uploaded files are stored in `server/uploads` (or `UPLOAD_DIR`) and served at `/uploads/...`.
- If Gemini key is missing, report upload still works, but AI analysis will return a clear error state.

## Troubleshooting

- If frontend cannot call backend, verify:
  - backend is running
  - correct `PORT` in `server/.env`
  - matching API URL in `client/.env`
  - CORS origin includes frontend URL
- If MongoDB connection fails, verify `MONGODB_URI`.
- If report AI analysis fails, verify `GEMINI_API_KEY`.



