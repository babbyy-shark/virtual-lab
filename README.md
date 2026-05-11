# ⚛ VIRTUAL-LAB

> A collaborative 2D physics sandbox for university-level learning.

## Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Frontend      | React 18, Vite, Tailwind CSS      |
| Physics       | Matter.js                         |
| Charts        | Recharts                          |
| Backend       | Node.js, Express                  |
| Database      | MongoDB (Mongoose)                |
| Real-time     | Socket.io                         |
| Routing       | React Router v6                   |

---

## Project Structure

```
virtual-lab/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Route pages
│   │   ├── hooks/           # usePhysics, etc.
│   │   ├── physics/         # Matter.js wrapper
│   │   └── styles/          # Global CSS
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                  # Node.js backend
│   ├── models/              # Mongoose schemas
│   ├── routes/              # REST API routes
│   ├── sockets/             # Socket.io handlers
│   └── server.js
└── package.json             # Root scripts
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (optional — server starts without it)

### 1. Install all dependencies
```bash
npm run install:all
```

### 2. Start development (frontend + backend together)
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:5000
- Health:   http://localhost:5000/api/health

### 3. Or run them separately
```bash
npm run client   # React dev server only
npm run server   # Express + Socket.io only
```

---

## Development Roadmap

| Phase | Feature                         | Status      |
|-------|---------------------------------|-------------|
| 1     | Physics canvas + Matter.js      | ✅ Done      |
| 2     | Constraints (springs, ropes)    | 🔄 Next      |
| 3     | Analytics dashboard (Recharts)  | 🔄 Next      |
| 4     | Backend API + MongoDB save/load | 🔄 Planned   |
| 5     | Multi-user Socket.io            | 🔄 Planned   |
| 6     | Experiment library templates    | 🔄 Planned   |
| 7     | Polish + classroom features     | 🔄 Planned   |

---

## Controls

| Action         | How                        |
|----------------|----------------------------|
| Place shape    | Click canvas               |
| Move object    | Drag                       |
| Select object  | Click object               |
| Delete object  | Select → DEL key           |
| Play / Pause   | Button or SPACE            |

---

## Mentors

**Prajit R** — 8807443789
