# Transitely MERN

Clean two-folder project:

- `frontend/` -> Vite + React + Tailwind CSS
- `backend/` -> Express + Socket.io + MongoDB (Mongoose)

Design assets from the old frontend are preserved in:

- `frontend/public/legacy/`

## Quick Start

1. Create backend env:

```bash
copy backend\\.env.example backend\\.env
```

2. Add your MongoDB URL in `backend/.env`:

```env
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>/<dbname>?retryWrites=true&w=majority
```

3. Run full stack:

```bash
npm run dev
```

## Commands

- `npm run dev` -> frontend + backend together
- `npm run dev:frontend` -> only frontend
- `npm run dev:backend` -> only backend

## Notes

- Old HTML entry pages were removed and replaced with React Router JSX routes.
- Frontend styling is Tailwind-based.
- You can extend route pages in `frontend/src/App.jsx` (or split into page components).
