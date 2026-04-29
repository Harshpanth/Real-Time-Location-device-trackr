# Trackr — Real-Time Device Tracking System
### Windows Setup Guide

A full-stack GPS tracking dashboard with live WebSocket updates, geofencing, history replay, and a dark-mode React UI.

---

## Prerequisites

Install these before starting:

| Tool | Download | Notes |
|------|----------|-------|
| Node.js 18+ | https://nodejs.org | Choose LTS. Adds `node` and `npm` to PATH automatically |
| MongoDB Community | https://www.mongodb.com/try/download/community | OR use free Atlas cloud (recommended) |
| Redis (optional) | https://www.memurai.com | Windows port of Redis. App works fine without it |

> **Tip:** After installing Node.js, open a new Command Prompt and run `node -v` to confirm it works.

---

## Step 1 — Install Dependencies

Open Command Prompt (`Win + R` → type `cmd` → Enter) or VS Code terminal, then:

```cmd
cd trackr

npm run install:all
```

This installs packages for backend, frontend, and simulator in one command.

If you prefer to install separately:

```cmd
cd backend
npm install
cd ..\frontend
npm install
cd ..\simulator
npm install
cd ..
```

---

## Step 2 — Configure Environment

The file `backend\.env` is already included with working defaults.
Open it in Notepad or VS Code and set your MongoDB connection:

```
backend\.env
```

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# ── Choose ONE of these ──────────────────────────────────────

# Option A: Local MongoDB (if you installed MongoDB Community)
MONGO_URI=mongodb://localhost:27017/trackr

# Option B: MongoDB Atlas — free cloud database (recommended)
# MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/trackr

# ── Redis (OPTIONAL) ────────────────────────────────────────
# Leave as-is if Redis is not installed — app runs fine without it
REDIS_URL=redis://localhost:6379

# ── JWT Secrets (change in production) ──────────────────────
JWT_ACCESS_SECRET=trackr_access_secret_change_me_in_production_2024
JWT_REFRESH_SECRET=trackr_refresh_secret_change_me_in_production_2024
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

BCRYPT_ROUNDS=12
```

### MongoDB Atlas setup (free, no local install needed)

1. Go to https://cloud.mongodb.com and create a free account
2. Create a free **M0** cluster
3. Under **Database Access** → add a user with a password
4. Under **Network Access** → click **Allow Access from Anywhere** (for dev)
5. Click **Connect** → **Drivers** → copy the connection string
6. Paste it as `MONGO_URI` in `backend\.env`, replacing `<password>`

---

## Step 3 — Start MongoDB (if local)

If you installed MongoDB Community locally, start it from Command Prompt:

```cmd
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

Or if MongoDB is in your PATH:

```cmd
mongod
```

Leave this window open.

---

## Step 4 — Run the Application

Open **two separate** Command Prompt or VS Code terminal windows:

### Terminal 1 — Backend

```cmd
cd trackr\backend
npm run dev
```

You should see:
```
✅ MongoDB connected: localhost
╔══════════════════════════════════════════╗
║         Trackr Backend Running           ║
╠══════════════════════════════════════════╣
║  API    : http://localhost:5000/api      ║
║  Health : http://localhost:5000/api/health║
╚══════════════════════════════════════════╝
```

### Terminal 2 — Frontend

```cmd
cd trackr\frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## Step 5 — Simulate a GPS Device

After registering an account and adding a device in the dashboard, copy the Device Key.

Open a **third** terminal:

```cmd
cd trackr\simulator
node simulator.js YOUR_DEVICE_KEY_HERE
```

Example with custom start location (Indore, India):

```cmd
node simulator.js YOUR_DEVICE_KEY_HERE 22.7196 75.8577
```

The simulator sends a GPS position every 3 seconds. Watch the marker move live on the dashboard map.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout |
| GET | /api/devices | List your devices |
| POST | /api/devices | Register new device |
| DELETE | /api/devices/:id | Delete device |
| GET | /api/locations/:id | Location history |
| GET | /api/locations/:id/replay | Replay route data |
| GET | /api/geofences | List geofences |
| POST | /api/geofences | Create geofence |
| DELETE | /api/geofences/:id | Delete geofence |
| GET | /api/alerts | Get alerts |
| PATCH | /api/alerts/:id/read | Mark alert read |

Health check: http://localhost:5000/api/health

---

## WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `location:update` | Device → Server | `{lat, lng, speed, accuracy}` |
| `location:update` | Server → Client | `{deviceId, lat, lng, timestamp}` |
| `device:offline` | Server → Client | `{deviceId}` |
| `device:online` | Server → Client | `{deviceId}` |
| `alert:geofence` | Server → Client | `{type, deviceId, fenceName, alert}` |
| `subscribe:device` | Client → Server | `deviceId` |

---

## Common Windows Errors & Fixes

### `'node' is not recognized as an internal or external command`
**Fix:** Node.js is not in your PATH.
- Reinstall Node.js from https://nodejs.org and check "Add to PATH" during install
- Restart Command Prompt after installing

### `ECONNREFUSED` on MongoDB
**Fix:** MongoDB is not running.
- Start it: `mongod` in a separate terminal
- Or switch to MongoDB Atlas (no local server needed)

### `npm run install:all` fails on first `&&`
**Fix:** Old cmd.exe does not support `&&` between npm scripts well.
Install each folder separately:
```cmd
cd backend && npm install
cd ..\frontend && npm install
cd ..\simulator && npm install
```

### Port 5000 already in use
**Fix:** Something else is using port 5000.
Edit `backend\.env` and change `PORT=5001`, then restart the backend.
Also update `frontend\vite.config.js` proxy target to `http://localhost:5001`.

### `EADDRINUSE :::5173`
**Fix:** Vite port is taken. Stop the old frontend instance (Ctrl+C) or run:
```cmd
npx vite --port 5174
```

### Redis connection errors in the console
These are **warnings only** — not errors. The app runs perfectly without Redis.
You will see: `Redis not available — running without heartbeat worker`
Ignore this during development.

### `ERR_MODULE_NOT_FOUND` for a package
**Fix:** Dependencies not installed. Run:
```cmd
cd backend
npm install
```

---

## Project Structure

```
trackr\
├── backend\
│   ├── src\
│   │   ├── config\        db.js, redis.js
│   │   ├── controllers\   auth, device, location, geofence, alert
│   │   ├── middleware\     auth, rbac, rate-limit, validation, error
│   │   ├── models\        User, Device, Location, Geofence, Alert
│   │   ├── routes\        all REST routes
│   │   ├── services\      auth, geofence business logic
│   │   ├── sockets\       location handler, heartbeat worker
│   │   └── utils\         jwt, ApiError, asyncWrapper, geoUtils
│   ├── .env               your environment config
│   └── package.json
├── frontend\
│   ├── src\
│   │   ├── components\    Map, Sidebar, Device, Alert, UI
│   │   ├── hooks\         useSocket, useDeviceHistory
│   │   ├── pages\         Dashboard, Tracking, History, Devices, Geofences
│   │   ├── services\      api.js (Axios), socket.js (Socket.io)
│   │   └── store\         auth, device, alert, geofence (Zustand)
│   └── package.json
├── simulator\
│   ├── simulator.js       GPS simulator
│   └── package.json
├── package.json           root scripts for convenience
└── README.md              this file
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, React-Leaflet |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB + Mongoose |
| Cache | Redis (optional) |
| Auth | JWT access + refresh tokens, bcrypt |
| Security | Helmet, CORS, rate limiting, mongo-sanitize, xss-clean |
| State | Zustand |
| Maps | Leaflet (CartoDB dark tiles) |
"# real-time-device-tracker" 
