# CarGarageCloud 🚗☁️

A full-stack, cloud-native vehicle management and technical dossier platform built with **React**, **Vite**, **Express**, **MongoDB Atlas**, **Dropbox Cloud Storage API**, **Auth0 IDaaS**, and **Firebase Hosting**.

---

## 🌟 Key Features & Cloud Architecture

- 🔐 **Identity & Access Management (Auth0):** Enterprise-grade Single Sign-On (SSO) with OpenID Connect (OIDC) and OAuth 2.0.
- 📦 **Cloud Object Storage (Dropbox API):** Direct and programmatic media upload for high-resolution vehicle imagery and car documents.
- 🗄️ **Scalable NoSQL Database (MongoDB Atlas):** Structured persistence for dynamic vehicle inventories, detailed technical specifications, maintenance logs, and timeline events.
- ⚡ **Realtime Database & Hosting (Firebase):** Edge CDN distribution, automated CI/CD deployment, and optional Firestore synchronisation.
- 🎨 **Modern Frontend (React 19 + Vite + Tailwind CSS):** Fast, responsive, and interactive vehicle gallery, dossier cards, and inspection records.

---

## 🏗️ Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                   USER (Client)                                   |
|                        [Web Browser: Desktop / Tablet / Mobile]                   |
+-----------------------------------------------------------------------------------+
                                          |
                                    HTTPS Request
                                          v
+-----------------------------------------------------------------------------------+
|                               AUTHENTICATION LAYER                                |
|             Auth0 Cloud IDaaS (OAuth 2.0 / OIDC - Universal Login & JWT)          |
+-----------------------------------------------------------------------------------+
                  |                                               |
                  v                                               v
+------------------------------------+          +------------------------------------+
|          FRONTEND APPLICATION      |          |          STORAGE LAYER             |
|   - React 19 + Vite + Tailwind CSS |          |   - Dropbox Cloud Storage API      |
|   - Hosted on Firebase Hosting CDN |          |   - High-Res Vehicle Imagery       |
+------------------------------------+          +------------------------------------+
                  |
                  v
+-----------------------------------------------------------------------------------+
|                                BACKEND & API LAYER                                |
|            Express.js REST API Server + MongoDB Atlas (Mongoose ODM)              |
+-----------------------------------------------------------------------------------+
```

---

## ⚙️ Environment Configuration

### 1. Frontend Configuration (`.env`)
Create a `.env` file in the root directory:
```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-audience

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=car-garage-599e2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=car-garage-599e2
VITE_FIREBASE_STORAGE_BUCKET=car-garage-599e2.firebasestorage.app
VITE_FIREBASE_APP_ID=your-firebase-app-id

# Dropbox API
VITE_DROPBOX_ACCESS_TOKEN=your-dropbox-access-token

# Backend API Endpoint
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Backend Configuration (`server/.env`)
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/carGarage?retryWrites=true&w=majority
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Frontend Setup
```bash
# Install dependencies
npm install

# Run frontend development server
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
# Navigate to backend directory
cd server

# Install backend dependencies
npm install

# Seed sample car dossier data
npm run seed

# Start Express server
npm start
```

---

## 📄 License & Attribution

Developed as part of the Cloud Computing Lab (Sem 5, B.Tech IT).
