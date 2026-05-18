# ⚛ VIRTUAL-LAB

> A collaborative 2D physics sandbox for university-level learning.

![Version](https://img.shields.io/badge/version-1.0.0-00e5a0)
![React](https://img.shields.io/badge/React-18-blue)
![Matter.js](https://img.shields.io/badge/Matter.js-0.19-orange)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green)

VIRTUAL-LAB addresses the gap between theoretical physics equations and physical intuition. Instead of watching a video about a pendulum, you build one, run it, and watch the energy graphs update live — together with your classmates in real time.

---

## Features

- **Interactive Physics Canvas** — drag and drop shapes (box, circle, triangle, plank, hexagon, wall) with 5 real materials (steel, rubber, wood, ice, concrete)
- **Constraint System** — connect bodies with springs, ropes, rods, and pivots; apply motors to spin any object
- **Real-Time Analytics** — live kinetic/potential energy charts, velocity vector arrows, per-body stats table
- **Multi-User Collaboration** — shared rooms with live cursor sync, body/constraint sync, and in-room chat via Socket.io
- **Save & Load** — persist experiments to MongoDB, reload anytime, browse your library
- **Experiment Library** — 6 pre-built templates (pendulum, Newton's Cradle, bridge, dominoes, ramp, spring-mass)
- **FPS Counter & Screenshot Export** — monitor performance and export your scene as PNG
- **Onboarding Tour** — first-time user guide

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Physics | Matter.js |
| Charts | Recharts |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |

---

## Project Structure

```
virtual-lab/
├── client/                        # React frontend
│   └── src/
│       ├── physics/engine.js      # Matter.js wrapper — all physics logic
│       ├── hooks/usePhysics.js    # React hook bridging physics to UI
│       ├── hooks/useSocket.js     # Socket.io connection and events
│       ├── utils/api.js           # HTTP client for backend API
│       ├── utils/serializer.js    # World state → JSON and back
│       ├── components/            # Toolbar, Inspector, Analytics, RoomPanel...
│       └── pages/                 # Lab, Library, Dashboard
└── server/                        # Node.js backend
    ├── server.js                  # Express + Socket.io entry point
    ├── models/Experiment.js       # MongoDB schema
    ├── routes/experiments.js      # REST API
    └── sockets/roomSocket.js      # Real-time room management
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Community Edition (running as a service)

### Install & Run

```bash
# Install all dependencies (root + client + server)
npm run install:all

# Start everything (frontend + backend)
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

### Test Multi-User Collaboration

1. Open `http://localhost:5173/room/test-room` in two browser tabs
2. Place a body in one tab — it appears in the other instantly
3. Add a spring between two bodies — the other tab sees it
4. Open the Room panel to chat and see live cursors

---

## Development Roadmap

| Phase | Feature |
|-------|---------|
| 1 | Physics canvas + Matter.js engine |
| 2 | Constraints — springs, ropes, rods, pivots, motors |
| 3 | Real-time analytics dashboard |
| 4 | Save/load experiments with MongoDB |
| 5 | Multi-user collaboration with Socket.io |
| 6 | Experiment library, templates, polish |

