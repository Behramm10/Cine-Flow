# Cine-Flow — Movie Booking Web Application

## Project Overview

Cine-Flow is a web-based movie discovery and booking application. Its routes include movie browsing and details, protected seat selection and checkout, ticket details, booking history, authentication, and an administrative page.

**Live deployment:** https://cine-flow-a012.onrender.com  
**Source repository:** https://github.com/Behramm10/Cine-Flow

## Technology Stack

- Frontend: React 18, TypeScript, Vite
- Routing: React Router
- UI: Tailwind CSS and shadcn/ui
- Backend services: Supabase
- Cloud hosting: Render Static Site
- Source control: Git and GitHub

## Application Routes

| Route | Purpose | Access |
|---|---|---|
| `/` | Home page | Public |
| `/movies` | Browse movies | Public |
| `/movie/:id` | Movie details | Public |
| `/movie/:id/seats` | Seat selection | Protected |
| `/checkout` | Checkout | Protected |
| `/ticket/:bookingId` | Ticket details | Protected |
| `/history` | Booking history | Protected |
| `/auth` | Authentication | Public |
| `/admin` | Administrative page | Protected |

Access restrictions and available operations also depend on the current application implementation and Supabase policies.

## Run Locally

### Prerequisites

- Node.js (current LTS recommended)
- npm
- Git
- Access to the Supabase project configured for the application

### Installation

```bash
git clone https://github.com/Behramm10/Cine-Flow.git
cd Cine-Flow
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal.

### Production build

```bash
npm run build
```

The production files are generated in `dist/`. To preview the build locally, run:

```bash
npm run preview
```

## Cloud Deployment Summary

Cine-Flow is deployed as a Render Static Site. Render builds the Vite frontend from GitHub and publishes the `dist/` directory. Supabase provides backend services used by the application.

Typical Render settings:

- Repository: `Behramm10/Cine-Flow`
- Branch: `main` (or the branch selected for deployment)
- Build command: `npm install && npm run build`
- Publish directory: `dist`

A rewrite rule supports React Router deep links:

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | Rewrite |

See [CLOUD_DEPLOYMENT_STEPS.md](CLOUD_DEPLOYMENT_STEPS.md) and [DEMONSTRATION_MATRIX.md](DEMONSTRATION_MATRIX.md).

## Configuration and Security Notes

- The Supabase publishable/legacy `anon` key is intended for client-side use, but database access must still be protected with appropriate Row Level Security (RLS) policies.
- Never place a Supabase `service_role` key or other privileged secret in frontend code or a `VITE_` variable.
- Ensure `.env` is excluded from version control by adding `.env` to `.gitignore`. If it has already been committed, deleting it from the latest version does not remove it from Git history.
- Repository-specific note: the `src/integrations/supabase/client.ts` version inspected during documentation preparation contains the Supabase URL and publishable/anon key as string literals. If this remains true in the deployed commit, Render environment variables will not replace those values unless the client is updated to read `import.meta.env`. Consider updating the client to use `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, then redeploy.
- If any privileged credential was committed, revoke or rotate it. Do not include passwords, tokens, or private user details in screenshots.

## Known Deployment Consideration

Render static hosting needs a rewrite for React Router paths. The `/*` → `/index.html` rule was added and nested-route refresh was reported as working.


