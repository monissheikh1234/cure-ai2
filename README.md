# cure-ai2
updated cureai with increased features
-----------------------------------------

# CureAI – AI Powered Healthcare Monitoring Platform
# CureAI - AI Powered Healthcare Monitoring Platform
Full-stack healthcare web platform with:
CureAI is a full-stack healthcare project where doctors and patients can manage records, upload medical reports, get AI-generated explanations, and view disease-linked organ highlights in a 3D viewer.
- **Doctor + Patient roles**
- **JWT auth** (bcrypt hashed passwords)
- **Patient lookup by Aadhaar number**
- **Medical report upload (Word .docx)** + **Gemini AI** summaries/explanations/recommendations
- **3D health visualization** (Three.js, disease-driven highlighting)
- **AI Fitness Monitor** card that redirects to an external posture-detection app (configurable)
## Features
## Tech stack
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
- **Frontend**: React (Vite), TailwindCSS, Axios, Three.js
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **AI**: Gemini API (Google)
## Tech Stack
---

