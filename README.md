# Tengra Platform (Frontend)

The **Tengra Platform** is the primary user-facing web application for the ecosystem. It is a comprehensive Monolith Frontend built with **Next.js 16** and **React 19**, serving as the unifying interface for the Blog, Forum, User Profiles, and Administration capabilities.

## Technical Architecture

### Core Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Tailwind Animate
- **State Management**: React Context + Hooks (minimal global state to preserve performance)
- **Code Editor**: TipTap (Headless wrapper around ProseMirror)

### Modular Design
The `app/` directory is structured to reflect the domain modules:

1.  **Blog Module** (`/app/blog`):
    -   Server-side rendering for article content.
    -   Dynamic routing for slugs (`[slug]/page.tsx`).
    -   Integration with the Backend API for fetching Markdown/HTML content.

2.  **Forum Module** (`/app/forum`):
    -   Interactive discussion boards.
    -   Real-time updates for new replies (polling/SWR).
    -   Nested layouts for categories and threads.

3.  **Admin Dashboard** (`/app/admin`):
    -   Protected routes (Middleware authentication check).
    -   Data visualization using `recharts`.
    -   User management tables with sorting and filtering.

## Key Algorithms & Flows

### Authentication Flow
1.  **Login**: User submits credentials to `/login`.
2.  **Token Exchange**: Frontend calls Backend API; receives an HTTP-only `session_token`.
3.  **Middleware**: `middleware.ts` intercepts requests to protected routes (`/admin/*`, `/profile/*`). It validates the presence of the cookie. If missing/invalid, redirects to `/login`.

### Rich Text Editing
The platform uses **ProseMirror** (via TipTap) for content creation.
-   **Storage**: Content is saved as HTML strings in the database but managed as JSON nodes in the editor state.
-   **Hydration**: When viewing a post, the HTML is sanitized using `isomorphic-dompurify` before rendering to prevent XSS.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL of the Tengra Core API (e.g., `https://api.tengra.studio`) |
| `NEXT_PUBLIC_CDN_URL` | URL for serving avatar/media (e.g., `https://cdn.tengra.studio`) |

## Routes & Structure

| Route | Function | Access |
|-------|----------|--------|
| `/` | Homepage (Feed) | Public |
| `/blog` | Blog Listing | Public |
| `/blog/[slug]` | Article View | Public |
| `/forum` | Forum Categories | Public |
| `/login` | Authentication | Guest |
| `/profile` | User Settings | Private |
| `/admin` | System Management | Admin |

## Development

**Install Dependencies:**
```bash
npm install
```

**Run Development Server:**
```bash
npm run dev
```
Listens on port **3000**.

## Usage
See `docs/USAGE.md`.


## Configuration
See `docs/CONFIGURATION.md`.


## Testing
See `docs/TESTING.md`.


## Troubleshooting
See `docs/TROUBLESHOOTING.md`.

