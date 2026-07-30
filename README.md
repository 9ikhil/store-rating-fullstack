# Store Rating App

A simple full-stack web app where normal users rate stores (1-5), store owners see
their store's ratings, and admins manage users/stores from a dashboard.

## Tech Stack

- **Backend:** Node.js, Express.js, Sequelize (PostgreSQL), JWT, bcrypt
- **Frontend:** React, React Router, Axios, plain CSS
- **Database:** PostgreSQL

## Architecture Overview

```
                        ┌─────────────────────┐
                        │   React Frontend     │
                        │  (React Router SPA)  │
                        │  localhost:3000       │
                        └──────────┬───────────┘
                                   │ Axios (JWT in Authorization header)
                                   ▼
                        ┌─────────────────────┐
                        │   Express REST API    │
                        │  localhost:5000/api   │
                        │  routes → middleware  │
                        │  → controllers        │
                        └──────────┬───────────┘
                                   │ Sequelize ORM
                                   ▼
                        ┌─────────────────────┐
                        │     PostgreSQL        │
                        │ users / stores /      │
                        │ ratings tables        │
                        └─────────────────────┘
```

**Backend layers**
- `routes/` — maps URL + HTTP verb to a controller function, applies `authenticate` /
  `authorize` middleware for role protection.
- `controllers/` — business logic (validation, DB queries via Sequelize models).
- `models/` — Sequelize model definitions + associations (`models/index.js`).
- `middleware/auth.js` — verifies JWT, attaches `req.user`, and role-gates routes.
- `utils/validators.js` — shared validation rules (name/email/password/address/rating).

**Frontend layers**
- `context/AuthContext.js` — holds the logged-in user + JWT in memory/localStorage.
- `components/PrivateRoute.js` — route guard, redirects unauthenticated/unauthorized users.
- `api/axios.js` — single Axios instance that auto-attaches the JWT token.
- `pages/` — one file per screen (Login, Register, dashboards, stores, etc).

## Database Schema

**users**
| column | type | notes |
|---|---|---|
| id | serial PK | |
| name | varchar(60) | 20-60 chars |
| email | varchar unique | |
| password | varchar | bcrypt hash |
| address | varchar(400) | |
| role | enum('admin','user','store_owner') | |

**stores**
| column | type | notes |
|---|---|---|
| id | serial PK | |
| name | varchar(60) | |
| email | varchar | |
| address | varchar(400) | |
| owner_id | FK → users.id | nullable |

**ratings**
| column | type | notes |
|---|---|---|
| id | serial PK | |
| user_id | FK → users.id | |
| store_id | FK → stores.id | |
| rating | integer | 1-5 |
| | | unique(user_id, store_id) — one rating per user per store |

Tables are auto-created by Sequelize (`sequelize.sync()`) on server start — no manual
SQL needed, just create an empty database.

## Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL running locally (or a remote instance)
- npm

## Step-by-Step Setup

### 1. Create the database

```bash
psql -U postgres
CREATE DATABASE store_rating_db;
\q
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```
PORT=5000
DB_NAME=store_rating_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=8h
```

Start the server (this also creates the tables automatically):

```bash
npm start
```

You should see `Database connection established`, `Models synced`, and
`Server running on port 5000`.

### 3. (Optional but recommended) Seed a default admin account

Since there's no UI to create the very first admin, run:

```bash
node seed.js
```

This creates:
- email: `admin@storerating.com`
- password: `Admin@1234`

Log in with this account, then use **Add User** to create additional admins,
normal users, or store owners.

### 4. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

The app opens at `http://localhost:3000` and talks to the API at
`http://localhost:5000/api` (configurable via `REACT_APP_API_URL` in `frontend/.env`).

## Typical First-Run Flow

1. Start PostgreSQL, run `npm start` in `backend/`, run `node seed.js` once.
2. Start `npm start` in `frontend/`.
3. Go to `http://localhost:3000`, log in as the seeded admin.
4. As admin: create a **Store Owner** user, then create a **Store** and assign that
   owner to it.
5. Log out, register a new **Normal User** account (or have the admin create one),
   log in, go to **Stores**, search/sort, and submit a rating.
6. Log in as the **Store Owner** to see the dashboard with average rating and the
   list of users who rated the store.

## API Reference

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | /api/register | public | Normal user self-registration |
| POST | /api/login | public | Login, returns JWT |
| PUT | /api/change-password | any logged-in user | Change own password |
| GET | /api/users | admin | List users (filters: name, email, address, role; sort: sortBy, sortOrder) |
| GET | /api/users/:id | admin | User detail (includes store rating if store_owner) |
| POST | /api/users | admin | Create a user of any role |
| GET | /api/stores | any logged-in user | List stores (filters: name, address; sort: sortBy, sortOrder; includes avg rating + own rating for normal users) |
| POST | /api/stores | admin | Create a store (optionally with ownerId) |
| POST | /api/ratings | normal user | Submit a new rating |
| PUT | /api/ratings/:id | normal user (own rating only) | Update a rating |
| GET | /api/dashboard/admin | admin | Total users / stores / ratings |
| GET | /api/dashboard/owner | store_owner | Store's average rating + raters list |

## Validation Rules

- **Name:** 20-60 characters
- **Email:** standard email format
- **Address:** max 400 characters
- **Password:** 8-16 characters, at least 1 uppercase letter, at least 1 special character
- **Rating:** integer 1-5

## Notes on Simplifications

- No refresh tokens — a single JWT valid for `JWT_EXPIRES_IN` (default 8h).
- No Docker/Redis — plain `npm start` on both sides.
- Sequelize `sync()` is used instead of hand-written migrations, to keep setup to a
  single `npm install` + `.env` edit as requested.
- Frontend styling is plain CSS (no component library), kept intentionally simple.
