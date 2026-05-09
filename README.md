# 🛒 Palengke WAIS — Full Stack

Real-Time Philippine Commodity Price Tracker + Community Forum

## Stack
- **Frontend**: React 18 + Redux Toolkit + RTK Query + React Router v6 + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Deployment**: Railway

## Features
- 📊 **80+ Commodity prices** — Palengke vs Supermarket, regional pricing, daily drift
- 🥗 **Nutrition data** — OpenFoodFacts API (Filipino name translation)
- 🍳 **Recipe Finder** — TheMealDB API (Filipino dish focus)
- 🗺️ **Market Locator** — OpenStreetMap geolocation
- 🛒 **Shopping List** — Download .txt/.csv
- 💬 **Community Forum** — Reddit-style posts, comments, nested replies, voting

## Local Development

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Set up PostgreSQL
Create a local database, then copy server/.env.example → server/.env and fill in DATABASE_URL.

### 3. Run migrations + seed
```bash
npm run db:migrate
npm run db:seed
```

### 4. Start dev servers
```bash
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:4000
```

## Deploy to Railway

### Step 1 — Push to GitHub
```bash
git init && git add . && git commit -m "Initial commit"
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/palengke-wais.git
git push -u origin main
```

### Step 2 — Create Railway project
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repository

### Step 3 — Add PostgreSQL
1. In Railway dashboard → New → Database → PostgreSQL
2. Railway auto-injects DATABASE_URL into your service

### Step 4 — Set environment variables
In Railway service → Variables → Add:
```
NODE_ENV=production
JWT_SECRET=your-long-random-secret-here
PORT=4000
```

### Step 5 — Run migrations on Railway
In Railway → your service → Shell:
```bash
npm run db:migrate
npm run db:seed
```

### Step 6 — Done!
Railway auto-deploys on every git push.

## Demo Accounts (after seeding)
| Role  | Email                      | Password    |
|-------|----------------------------|-------------|
| Admin | admin@palengkewais.ph      | Admin@123   |
| User  | nanay@example.com          | User@1234   |

## Project Structure
```
palengke-wais/
├── package.json          # Root scripts (dev, build, start)
├── railway.toml          # Railway deployment config
├── nixpacks.toml         # Build config
├── server/
│   ├── index.js          # Express app entry
│   ├── db/
│   │   ├── pool.js       # PostgreSQL pool
│   │   ├── migrate.js    # Schema migration
│   │   └── seed.js       # Demo data
│   ├── middleware/
│   │   └── auth.js       # JWT middleware
│   └── routes/
│       ├── auth.js       # Register, login, /me
│       └── forum.js      # Posts, comments, votes
└── client/
    ├── src/
    │   ├── api/forum.js       # Axios API client
    │   ├── app/
    │   │   ├── store.js       # Redux + RTK Query
    │   │   └── authSlice.js   # Auth state
    │   ├── pages/
    │   │   ├── ForumPage.jsx
    │   │   ├── PostDetailPage.jsx
    │   │   ├── AuthPage.jsx
    │   │   └── ... (price, recipe, map pages)
    │   └── components/
    └── dist/              # Built frontend (served by Express in prod)
```
