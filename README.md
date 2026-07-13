# Customer Query Management System

A full-stack CRUD application to manage customer queries.

## Tech Stack

- **Frontend**: React + Vite, React Router, Axios, CSS Modules
- **Backend**: Node.js, Express, MongoDB, Mongoose

## Getting Started

### Backend
```bash
cd backend
npm install
# Configure .env with your MONGO_URI
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint           | Description         |
|--------|--------------------|---------------------|
| GET    | /api/queries       | List all queries    |
| POST   | /api/queries       | Create a query      |
| GET    | /api/queries/:id   | Get query by ID     |
| PUT    | /api/queries/:id   | Update a query      |
| DELETE | /api/queries/:id   | Delete a query      |

Query params for GET /api/queries: `status`, `priority`, `search`, `page`, `limit`
