# Linkedinify

A LinkedIn-style social networking web app built with **Next.js 16**, **Convex** (realtime backend & database), **Clerk** (auth), and **Tailwind CSS v4**. Users can sign in, create text / image posts, like, comment, follow other users, and browse profiles.

---

## Features

- Email / social auth via Clerk
- Create posts with text, image upload, and tags
- Like & unlike posts
- Comment on posts
- Follow / unfollow other users
- User profiles with bio, skills, location, website
- Search for users
- Feed tabs (all posts / following)
- Realtime updates powered by Convex

---

## Tech stack

| Layer     | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router, React 19) |
| Styling   | Tailwind CSS v4 |
| Auth      | Clerk (`@clerk/nextjs`) |
| Backend   | Convex (database, queries, mutations, file storage) |
| Language  | TypeScript |

---

## Project structure

```
linkedinify/
├── app/                  # Next.js App Router pages
│   ├── create/           # Create-post page
│   ├── post/             # Post detail pages
│   ├── profile/          # User profile pages
│   ├── search/           # User search
│   ├── sign-in/          # Clerk sign-in
│   ├── sign-up/          # Clerk sign-up
│   ├── layout.tsx
│   ├── page.tsx          # Home feed
│   └── providers.tsx     # Convex + Clerk provider
├── components/           # Reusable React components
├── convex/               # Convex backend
│   ├── schema.ts         # DB schema (users, posts, likes, comments, follows)
│   ├── users.ts
│   ├── posts.ts
│   ├── likes.ts
│   ├── comments.ts
│   ├── follows.ts
│   ├── files.ts          # File upload / storage URLs
│   └── auth.config.ts    # Clerk <-> Convex auth bridge
├── lib/                  # Utilities
├── public/               # Static assets
├── middleware.ts         # Clerk route protection
└── .env.example          # Env-var template
```

---

## Prerequisites

Before you start, make sure you have:

- **Node.js 20+** and **npm** (or yarn / pnpm / bun)
- A **Clerk account** — https://clerk.com
- A **Convex account** — https://convex.dev
- **Git** installed

---

## Setup — step by step

### 1. Clone the repo

```bash
git clone https://github.com/sankha4567/Linkedinify.git
cd Linkedinify
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Clerk application

1. Go to https://dashboard.clerk.com and create a new application.
2. Enable the sign-in methods you want (email, Google, GitHub, etc.).
3. From **API Keys** copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. From **Domains** / **API Keys** page, copy your **Frontend API URL** — it looks like `https://xxxx-xxxx.clerk.accounts.dev`. This goes into `CLERK_FRONTEND_API_URL`.

### 4. Create a Convex project

```bash
npx convex dev
```

The first run will:
- Ask you to log into Convex
- Let you create / pick a project
- Automatically write `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` into `.env.local`
- Push the schema in `convex/schema.ts` and deploy your Convex functions
- Keep running and watch for changes — **leave this terminal open while you develop**

### 5. Configure environment variables

Copy the example file and fill in the values you collected above:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud

CLERK_FRONTEND_API_URL=https://your-clerk-frontend-api.clerk.accounts.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

### 6. Wire Clerk to Convex

`convex/auth.config.ts` already reads `CLERK_FRONTEND_API_URL`. After you set it in `.env.local`, restart `npx convex dev` so Convex picks up the new env var.

In your Convex dashboard (Settings → Environment Variables) also add:

- `CLERK_FRONTEND_API_URL` — same value as your `.env.local`

This lets the Convex backend verify Clerk JWTs.

### 7. Run the dev server

In a **second terminal** (keep `npx convex dev` running in the first):

```bash
npm run dev
```

Open http://localhost:3000 — sign up, and you're in.

---

## Scripts

| Command         | What it does |
|-----------------|--------------|
| `npm run dev`   | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production build |
| `npm run lint`  | Run ESLint |
| `npx convex dev`| Run Convex dev (schema push + function hot-reload) |

---

## Deployment

### Convex (backend)

```bash
npx convex deploy
```

Copy the resulting production `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` into your hosting provider's env vars. Also set `CLERK_FRONTEND_API_URL` in the Convex production environment.

### Next.js (frontend) — Vercel

1. Push the repo to GitHub (already done — see below).
2. Import the repo at https://vercel.com/new.
3. Add these env vars in Vercel:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `CLERK_FRONTEND_API_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Deploy.

---

## Troubleshooting

- **"Missing NEXT_PUBLIC_CONVEX_URL"** — you forgot to create `.env.local` or didn't run `npx convex dev`.
- **Clerk redirect loop / 401 from Convex** — `CLERK_FRONTEND_API_URL` is missing or mismatched; set it in both `.env.local` and the Convex dashboard, then restart `npx convex dev`.
- **`next-env.d.ts` errors** — run `npm run build` once; Next.js regenerates it.
- **Schema changes not showing up** — make sure `npx convex dev` is running; it pushes schema changes automatically.

---

## License

MIT
