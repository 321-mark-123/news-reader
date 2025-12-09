# News Reader - Prompt

## Role

You are a senior product engineer and UX lead.  
You design and ship a modern, performant React + Vite web app and a Node/Express proxy that hides secrets.  
You think pragmatically, choose lightweight dependencies, and produce production-ready code with clear structure.

## Task

Create a complete, runnable project called news-reader that includes:

Frontend: React + Vite + TypeScript  
Backend: Node.js (Express) proxy to securely call TheNewsApi  
Implements a Flipboard-like single-article view with category and search filters, pagination, caching, prefetching, favorites, and responsive design  
Ships with scripts to run dev servers, ignores secrets, and provides a .env.example  
Context  
Data Source: TheNewsApi “All News” endpoint only  
GET https://api.thenewsapi.com/v1/news/all

## Behavior

Language fixed to en for all requests  
Limit 3 results per page (limit=3)  
Categories: tech (default), general, science, sports, business, health, entertainment, politics, food, travel

Search vs Category Rule:

If search input has value → search=<value> (no categories)  
If search input empty → categories=<selected> (no search)

## Pagination

Show one article at a time in a large “featured” card  
Circular pager at bottom:  
Buttons: « (first page), ‹ (prev), three numbered dots (absolute article numbers), › (next)  
Prefetch next page when user reaches index 1 (2nd article)  
Prefetch previous page when index = 0 and page > 1  
Instant swap to prefetched page (no flashing old content)

## Caching

Cache pages by page number in memory  
Jumping back to page 1 uses cached results

## Loading

When switching category/search, clear current items and show a full-height loading skeleton/spinner

## Errors

429 → “Daily request limit reached…”
401/403 → “TheNewsApi authentication failed…”

## Favorites

Toggle “Save to Favorites” on each card
Persist favorites in localStorage
Sidebar includes “Favorites” view; exiting restores live results

## UI / UX

### Desktop

Left sidebar: search + categories; Favorites button at bottom
Right content: one featured article card with overlay text panel on image
Filters always visible (no collapse)

### Mobile

One-column layout
“Show/Hide Filters” toggle
Card height expands to avoid scroll

### Card Visuals

Responsive height with reserved space for pager/filters
Fallback image if missing
“View Full Article” call-to-action

### Visual Polish

Background: #333 with subtle gradient
Panels slightly lighter than header
Box shadows, hover states, pointer cursor
Accessibility: alt text, semantic roles

## Debugging

Client logs proxied URL (no token)
Server never logs raw token

## Security:

Never expose API tokens in the browser — use the Express proxy
.env contains THENEWSAPI_TOKEN; .env.example includes a placeholder
Never commit real tokens or secrets

## Tech Stack:

React + Vite + TypeScript
Express on Node 16+
Minimal dependencies
Vite proxy → /api/\*
Use plain CSS (modules or global styles.css)

## API Specifics:

Endpoint: /v1/news/all only
Params: language=en, limit=3, page, and either categories OR search
Default category = tech
Reset state on category/search change
Favorites must not break navigation

## Build/Run:

Root scripts run both proxy + web together
Proxy on port 5177, Web on port 5176
.gitignore excludes .env and includes .env.example

## Format

Output the full project as code blocks enclosed in four backticks.
Each file must start with a filepath comment.

### Include:

Root
package.json (scripts: server:dev, server:install, web:dev, dev)
.gitignore with env rules
/server
package.json
server.js
.env.example
README.md
Express routes: /api/health, /api/news/all
/web
package.json
vite.config.ts
tsconfig.json
index.html
/src
App.tsx
styles.css
lib/newsapi.ts
components/HeadlinesList.tsx
/public/placeholder.png

### After Code

Include a “How to Run” section with the following commands:

npm run server:install
npm run dev
Set THENEWSAPI_TOKEN in .env before running.
Never commit real tokens.
