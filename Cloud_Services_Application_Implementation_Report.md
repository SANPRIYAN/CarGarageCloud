# Cloud Services Application – Implementation Report

---

## 1. Title Page

- **Title:** Building Applications with Cloud Services
- **Project Title:** CAR-GARAGE: Cloud-Enabled Personal Vehicle Management & Dossier Web Application
- **Team Members Name & Reg Number:** 
  - Sanjay Priyan S — **24IT069**
  - *(Add additional team member names & registration numbers here if applicable)*
- **Slot:** *(e.g., L31+L32 / A1+TA1 / As assigned)*
- **Course Name:** Cloud Computing Lab (Sem 5, B.Tech IT)
- **Faculty Name:** *(Faculty In-Charge Name)*

---

## 2. Problem Statement

### What application was developed?
**CAR-GARAGE** is a full-stack, cloud-native vehicle management and technical dossier web application. It empowers car enthusiasts, garage owners, and automotive collectors to catalog their vehicles, track technical specifications, record performance telemetry, log maintenance histories, and organize high-resolution vehicle imagery seamlessly across cloud environments.

### What problem does it solve?
Automotive owners and collectors frequently face challenges maintaining fragmented documentation across paper logs, local folders, and generic note apps. High-resolution images consume excessive local disk space and are prone to data loss, while technical specs, modification histories, and service timelines lack structured querying. **CAR-GARAGE** resolves this by decoupling media storage, transactional data persistence, identity management, and application hosting into dedicated, high-availability cloud services:
1. Eliminates local storage bottlenecks by offloading vehicle media directly to cloud storage via secure APIs.
2. Prevents data fragmentation through centralized, schema-flexible cloud NoSQL database storage.
3. Secures user-specific vehicle collections behind enterprise-grade cloud authentication with Single Sign-On (SSO).

### Who are the intended users?
- **Automotive Enthusiasts & Collectors:** Individuals tracking specs, modifications, achievements, and galleries of their personal car collection.
- **Independent Garage / Workshop Owners:** Technicians recording vehicle details, servicing logs, maintenance timelines, and component specifications.
- **Everyday Vehicle Owners:** Drivers seeking a secure, cloud-accessible digital glovebox for vehicle profiles, inspection records, and documents.

---

## 3. Objectives

1. **To develop a responsive, multi-tier cloud-based web application** delivering interactive vehicle management and dossier visualization.
2. **To implement cloud object/file storage** (Dropbox Cloud Storage API) for programmatically uploading, managing, and generating direct-embed URLs for vehicle images.
3. **To integrate a scalable cloud NoSQL database** (MongoDB Atlas) for structured persistence of dynamic vehicle inventories, detailed technical specifications, maintenance logs, and timeline events.
4. **To deploy and host the application using a cloud hosting platform** (Firebase Hosting) with automated CI/CD pipeline capabilities, edge CDN distribution, and SSL certificate provisioning.
5. **To implement enterprise cloud user authentication and Single Sign-On (SSO)** using Auth0 Identity-as-a-Service (IDaaS) with OpenID Connect (OIDC) and OAuth 2.0 standards.

---

## 4. Application Architecture

### 4.1. Conceptual Architecture Diagram

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
|             Auth0 Cloud IDaaS (OAuth 2.0 / OIDC - Universal Login & JWT)           |
+-----------------------------------------------------------------------------------+
                                          |
                                Authorized Token & Context
                                          v
+-----------------------------------------------------------------------------------+
|                             HOSTED APPLICATION LAYER                              |
|           Firebase Hosting (Google Global Edge CDN, SSL Termination, SPA Routing)  |
|               React 19 + Vite 8 SPA Client (Axios + TanStack React Query)         |
+-----------------------------------------------------------------------------------+
                       |                                    |
            REST API Calls (JSON)                  Direct Binary Upload (Stream)
                       v                                    v
+-------------------------------------------+   +-----------------------------------+
|           BACKEND SERVICE LAYER           |   |       CLOUD STORAGE SERVICE       |
|    Node.js + Express.js REST Microservice |   |    Dropbox Cloud Storage API v2   |
|   (/api/cars, /api/cars/:id/details)      |   |  - Path: /car-garage/<carName>/   |
+-------------------------------------------+   |  - Direct Streamable Raw Media    |
                       |                        +-----------------------------------+
            Mongoose ODM / TCP 27017                                ^
                       v                                            |
+-------------------------------------------+                       |
|           CLOUD DATABASE SERVICE          |                       |
|         MongoDB Atlas Cloud NoSQL         |                       |
|    - 'cars' collection                    |                       |
|    - 'vehicleProfiles' collection         |-----------------------+
|  (Stores metadata, specs & Dropbox URLs)  |  (Image URL reference linking)
+-------------------------------------------+
```

---

### 4.2. Actual Deployment Architecture

```mermaid
graph TD
    Client["User Device (Web Browser)"] -->|1. HTTPS / Auth Request| Auth0["Auth0 Cloud IDaaS (Tenant: dev-jv27zlh4r7j10e2f)"]
    Auth0 -->|2. JWT / OIDC Claims| Client
    Client -->|3. Load Single Page App| FirebaseHosting["Firebase Hosting (Google Cloud Global CDN: car-garage-599e2.web.app)"]
    Client -->|4. REST Calls (CRUD)| ExpressAPI["Express REST Server (Node.js runtime / Cloud App Service)"]
    ExpressAPI -->|5. TLS Connection string| MongoAtlas["MongoDB Atlas Cloud Database (Cluster: car-garage.lmu0d9w.mongodb.net)"]
    Client -->|6. Binary Upload & Shared Link| DropboxAPI["Dropbox Cloud Content Storage API (content.dropboxapi.com)"]
    DropboxAPI -.->|7. Direct CDN Image Link| MongoAtlas
```

---

### 4.3. Cloud Services Summary Table

| Requirement | Cloud Service Used | Purpose |
| :--- | :--- | :--- |
| **Storage** | **Dropbox Cloud Storage API v2** | Programmatic cloud storage of high-resolution car images, auto-renamed folder partitioning, and permanent direct CDN links. |
| **Database** | **MongoDB Atlas (Cloud NoSQL DB)** | Fully-managed cloud database storing car collections, vehicle dossiers, technical specs, performance statistics, and service history. |
| **Hosting** | **Firebase Hosting (Google Cloud Edge)** | Production hosting of compiled React 19 SPA with global CDN caching, SSL encryption, and atomic zero-downtime rollouts. |
| **Authentication**| **Auth0 Identity-as-a-Service (IDaaS)** | Universal Login, user signup, Google Social Single Sign-On (SSO), email/password auth, and JSON Web Token (JWT) session lifecycle. |

---

## 5. Technologies Used

| Category | Technology / Service | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19, Vite 8 | Declarative component UI library paired with modern build tooling for lightning-fast HMR and bundle compilation. |
| **Styling & Icons** | Tailwind CSS v4, Lucide Icons | Utility-first CSS engine with dark automotive aesthetics, glassmorphic cards, gradient typography, and UI icons. |
| **State & Data Fetching** | TanStack React Query v5, Axios | Async server-state management with automatic cache invalidation, refetching, and promise-based HTTP client. |
| **Backend Framework** | Node.js (v18+), Express.js | High-throughput asynchronous backend REST API providing CRUD routes for vehicle inventory and detailed specs. |
| **Database Connector** | Mongoose ODM v8 | Object Data Modeling (ODM) library providing schema validation, virtual fields, and index management for MongoDB Atlas. |
| **Cloud Storage SDK** | Dropbox REST API v2 | Content upload and sharing endpoints (`/files/upload`, `/sharing/create_shared_link_with_settings`). |
| **Authentication SDK** | `@auth0/auth0-react` | Client-side SDK wrapping React context to handle login redirection, token refresh, and user profile state. |
| **Programming Languages**| JavaScript (ES6+), JSX, JSON, HTML5, CSS3 | Standard modern ECMAScript stack utilized across client and server environments. |

---

## 6. Implementation

### 6.1. Major Modules & Features Developed

1. **Authentication & Identity Wrapper (`AuthWrapper.jsx`):**
   - Guards application routes so only authenticated users can access the personal garage.
   - Provides user avatar, display name, and one-click logout in the navigation bar.
   - Renders a branded login landing page for unauthenticated visitors.

2. **Vehicle Inventory Management (`AddCarForm.jsx`, `CarList.jsx`, `CarCard.jsx`):**
   - Allows users to add vehicles with brand make, model, year, and image uploads.
   - Real-time catalog view displaying vehicle cards with live image thumbnails and direct navigation to detailed dossiers.
   - Delete functionality that removes both the database record and the corresponding cloud-stored image.

3. **Multi-Service Orchestration (`carImageOrchestrator.js`):**
   - Orchestrates the atomic workflow:
     1. Receives vehicle metadata and file from the UI.
     2. Generates sanitized cloud folder paths (`/car-garage/<make_model>/`).
     3. Streams the binary file to Dropbox Cloud Storage.
     4. Obtains a direct-embed shareable URL (`dl.dropboxusercontent.com`).
     5. Writes the resulting URL and metadata into the MongoDB Atlas document.

4. **Comprehensive Vehicle Dossier (`CarDetailsPage.jsx`):**
   - 10+ categorized specifications sections: General specs, Dimensions & Weight, Powertrain, Performance telemetry (0-100 km/h, Top Speed, HP, Torque), Heritage, Awards, Ownership, and Maintenance History.

---

### 6.2. Storage Implementation

- **Storage Service Selected:** **Dropbox Cloud Storage API v2**
- **Integration Procedure:**
  1. Registered a developer application under the Dropbox Developer Portal with **Scoped Access** (`App folder`).
  2. Granted OAuth 2.0 permissions: `files.content.write`, `files.content.read`, and `sharing.write`.
  3. Acquired developer access credentials and saved them in `.env` as `VITE_DROPBOX_ACCESS_TOKEN`.
  4. Implemented `uploadFileToDropbox()` sending `POST` requests to `https://content.dropboxapi.com/2/files/upload` with `application/octet-stream` headers.
  5. Implemented `getSharedLink()` hitting `https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings` to transform Dropbox links into raw media URLs (`dl.dropboxusercontent.com`).

#### Key Storage Code Snippet (`src/services/dropbox/dropboxUpload.js`):
```javascript
export async function uploadFileToDropbox(accessToken, path, file) {
  const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({ path, mode: 'add', autorename: true }),
    },
    body: file,
  });
  if (!response.ok) throw new Error(`Dropbox upload failed: ${response.statusText}`);
  return response.json();
}
```

#### Storage Evidence:
- **Dropbox App Folder Structure:**
  ```text
  Dropbox Apps/car-garage-storage/
  ├── car-garage/
  │   ├── porsche_911_gt3/
  │   │   └── porsche_911_gt3.jpg
  │   ├── bmw_m4_competition/
  │   │   └── bmw_m4_competition.png
  │   └── ford_mustang_mach1/
  │       └── ford_mustang_mach1.jpg
  ```
- **Configuration Parameter:** Token authenticated via Bearer headers in REST calls.

---

### 6.3. Cloud Database Implementation

- **Database Service Selected:** **MongoDB Atlas (M0 Free Tier Cloud Cluster)**
- **Cluster URI:** `mongodb+srv://sanjaypriyan:****@car-garage.lmu0d9w.mongodb.net/carGarage?retryWrites=true&w=majority`
- **Collections Configured:**
  - `cars`: Basic vehicle entity records containing `make`, `model`, `ownerId`, `imageUrl`, `imagePath`, and timestamps.
  - `vehicleProfiles`: Deep technical specifications containing powertrain, safety ratings, timeline arrays, awards, and maintenance logs.

#### Sample JSON Record from MongoDB Atlas (`cars` collection):
```json
{
  "_id": { "$oid": "664b3f81e3a2b70014a51e9b" },
  "make": "Porsche",
  "model": "911 GT3",
  "ownerId": "auth0|662fd901a8b92c43110e5d89",
  "garageId": "garage_user_069",
  "ownerName": "Sanjay Priyan",
  "imageUrl": "https://dl.dropboxusercontent.com/scl/fi/abc123xyz/porsche_911_gt3.jpg",
  "imagePath": "/car-garage/porsche_911_gt3/porsche_911_gt3.jpg",
  "createdAt": "2026-07-15T08:30:00.000Z",
  "updatedAt": "2026-07-15T08:32:15.000Z"
}
```

---

### 6.4. Cloud Hosting / Deployment

- **Hosting Service Selected:** **Firebase Hosting (Google Cloud Edge Network)**
- **Project ID:** `car-garage-599e2`
- **Application Live URL:** `https://car-garage-599e2.web.app` (Alternative: `https://car-garage-599e2.firebaseapp.com`)
- **Deployment Procedure:**
  1. Configured `firebase.json` specifying public build directory as `dist` and single-page application (SPA) rewrite rules:
     ```json
     {
       "hosting": {
         "public": "dist",
         "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
         "rewrites": [{ "source": "**", "destination": "/index.html" }]
       }
     }
     ```
  2. Executed production bundle build:
     ```bash
     npm run build
     ```
  3. Deployed the compiled application to Google Cloud Edge CDN:
     ```bash
     firebase deploy --only hosting
     ```
- **Verification Evidence:** Fast global delivery via HTTP/2, automated free SSL certificate provisioning, and instantaneous SPA route resolution.

---

### 6.5. Cloud Authentication Implementation

- **Authentication Service Used:** **Auth0 by Okta (Cloud Identity-as-a-Service)**
- **Auth0 Domain:** `dev-jv27zlh4r7j10e2f.us.auth0.com`
- **Client ID:** `RDDO9YboC5G1yEKWOng78OU0XezZ1ks9`
- **Authentication Methods Enabled:**
  1. Social Identity Provider: **Google OAuth 2.0 Single Sign-On (SSO)**.
  2. Database Connection: **Username & Password Authentication** with salted bcrypt hashing and password policy enforcement.
- **Integration Flow:**
  - Application wraps root with `<Auth0Provider>` in `src/main.jsx`.
  - Unauthenticated access triggers redirect to Auth0 Universal Login hosted page.
  - Upon successful verification, Auth0 issues ID tokens and Access tokens, populating `user` profile properties (`user.name`, `user.email`, `user.sub`) directly into React state.

#### Authentication Setup Code (`src/main.jsx`):
```javascript
<Auth0Provider
  domain={import.meta.env.VITE_AUTH0_DOMAIN}
  clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
  authorizationParams={{ redirect_uri: window.location.origin }}
>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</Auth0Provider>
```

---

## 8. Final Application / Output

### 8.1. Working Application Features & Screens

- **Screen 1: Cloud Universal Login & Authentication**
  - Modern glassmorphic interface prompting Google SSO or Email/Password credentials through Auth0.
  - Automatically isolates user garages based on unique user sub identifiers.

- **Screen 2: Personal Garage Dashboard (`/`)**
  - Top header displaying personalized welcome banner (`Welcome back, Driver/Sanjay`).
  - Left panel: Quick "Add Vehicle" card with real-time file upload input and progress feedback.
  - Right panel: Grid of vehicle cards with cloud-rendered Dropbox photo badges, brand logos, and action buttons ("View Dossier", "Delete").

- **Screen 3: Deep Vehicle Technical Dossier (`/car/:id`)**
  - Full vehicle breakdown including engine cylinder configuration, transmission ratios, suspension types, safety ratings, and dynamic acceleration curves.
  - Service and maintenance log table with historical timestamps.

### 8.2. Application Deployment Information

- **Live Application URL:** [https://car-garage-599e2.web.app](https://car-garage-599e2.web.app)
- **Backend API Endpoint:** `/api/cars` & `/api/cars/:carId/details` (Port `5000` / Cloud Microservice)

---

## 9. Challenges and Solutions

| Challenge Encountered | Root Cause | Technical Solution Implemented |
| :--- | :--- | :--- |
| **1. Expiring Dropbox Access Tokens** | Dropbox migrated to short-lived OAuth tokens (4-hour lifespan), causing file uploads to fail after token expiration. | Created a centralized token retrieval abstraction (`dropboxAuth.js`) that verifies token validity before each upload and prepared the architecture for OAuth 2.0 refresh-token automatic renewal. |
| **2. Cross-Origin Image Display Block (CORS & Direct Embeds)** | Standard Dropbox shared URLs link to interactive web preview pages (`www.dropbox.com`) rather than raw binary image streams, leading to broken `<img>` tags. | Implemented automatic URL string rewriting in `getSharedLink()` to replace `www.dropbox.com` with `dl.dropboxusercontent.com` and strip the `?dl=0` query parameter, enabling direct browser embedding. |
| **3. Orphaned Cloud Files on Failed Database Insertions** | If network drops occur after the image is saved to Dropbox but before the MongoDB document updates, orphaned files waste cloud storage. | Implemented an orchestration pattern in `carImageOrchestrator.js` with structured error handling: if the database update rejects, cleanup handlers (`deleteFileFromDropbox`) are triggered to remove the stranded file. |
| **4. SPA Routing 404s on Page Refresh** | Refreshing routes like `/car/:carId` caused 404 errors on static hosts because the physical file does not exist on the server. | Configured URL rewrite rules in `firebase.json` directing all route patterns (`"source": "**"`) to `/index.html`, letting React Router manage client-side routing smoothly. |

---

## 10. Conclusion

In this project, **CAR-GARAGE** was successfully engineered and deployed as a modern, cloud-integrated vehicle dossier and inventory management system. By seamlessly orchestrating **Auth0** for identity and Single Sign-On, **Dropbox Cloud Storage API** for binary media storage, **MongoDB Atlas** for multi-document NoSQL database persistence, and **Firebase Hosting** for high-availability edge web distribution, the application demonstrates a resilient multi-cloud architecture. Through this implementation, critical practical outcomes were mastered, including managing decoupled cloud services, implementing secure API authentication tokens, synchronizing distributed transactional states between cloud storage and databases, and configuring automated cloud deployment pipelines.

---

## 11. References

1. **Auth0 by Okta Documentation**, "Single Page App Quickstart for React & OpenID Connect", *Auth0 Docs*, 2024. [Online]. Available: https://auth0.com/docs/quickstart/spa/react
2. **Dropbox Developer Guide**, "Dropbox API v2: HTTP Endpoints & File Upload Reference", *Dropbox Developers*, 2024. [Online]. Available: https://www.dropbox.com/developers/documentation/http/documentation
3. **MongoDB Atlas Documentation**, "Cloud Database Service & Mongoose ODM Driver Configuration", *MongoDB Docs*, 2024. [Online]. Available: https://www.mongodb.com/docs/atlas/
4. **Google Firebase Documentation**, "Deploy Web Apps with Firebase Hosting & CLI", *Firebase Guides*, 2024. [Online]. Available: https://firebase.google.com/docs/hosting
5. **P. Mell and T. Grance**, "The NIST Definition of Cloud Computing", *National Institute of Standards and Technology (NIST)*, Special Publication 800-145, 2011.
