# Customer Query Management System

A full-stack, enterprise-grade application designed to manage and track customer support queries efficiently. Built with a modern, minimal UI and a robust REST API backend.

## 🚀 Features

- **Role-Based Access Control**: Separate workflows for Customers (Users) and Support Agents (Admins).
- **Customer Portal**: 
  - Submit new support queries without requiring an account (public form).
  - Register/Login to track the real-time status of all submitted queries.
  - Receive visual notifications when a query status changes.
- **Admin Dashboard**: 
  - Comprehensive overview of all system queries with statistical breakdown.
  - Filter queries by status, priority, or search by customer name/title.
  - Update query statuses (Open, In-Progress, Resolved, Closed) and priorities.
  - Real-time notifications for newly submitted queries.
- **Modern UI/UX**: Clean, responsive, glass-free enterprise design system built on an 8px grid.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Router DOM, Zustand (State Management), Axios, CSS Modules.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JSON Web Tokens (JWT), bcryptjs, express-validator.

## ⚙️ Environment Variables

You will need to create a `.env` file in the root directory (or in the respective `backend`/`Frontend` directories depending on your setup) with the following values:

**Backend (`backend/.env` or `/api/.env`)**:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
```

**Frontend (`Frontend/.env`)**:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 💻 Getting Started

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
```
*The server will start on http://localhost:5000*

### 2. Start the Frontend
```bash
cd Frontend
npm install
npm run dev
```
*The application will start on http://localhost:5173*

## 🛣 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| **POST** | `/api/auth/register` | Public | Register a new customer account |
| **POST** | `/api/auth/login` | Public | Login as a customer |
| **POST** | `/api/auth/admin/login`| Public | Login as an admin (via env variables) |
| **POST** | `/api/queries/submit` | Public | Submit a query without logging in |
| **GET** | `/api/queries/my` | User | Get all queries for the logged-in user |
| **GET** | `/api/queries/stats` | Admin | Get statistical counts of query statuses |
| **GET** | `/api/queries` | Admin | List all queries (supports filtering/pagination) |
| **POST** | `/api/queries` | Admin | Create a query manually |
| **GET** | `/api/queries/:id` | Auth | Get a single query by ID |
| **PUT** | `/api/queries/:id` | Admin | Update query status, priority, or details |
| **DELETE**| `/api/queries/:id` | Admin | Delete a query entirely |

*Query params for GET /api/queries:* `status`, `priority`, `search`, `page`, `limit`

## 🗄 Database Schema
This project uses MongoDB. The collection schema details can be found in the included `database_schema.md` file.

---
*Developed for Full Stack Developer Assessment.*
