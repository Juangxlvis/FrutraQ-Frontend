# FrutraQ — Frontend

A mobile-first Progressive Web App for a fruit transporter to manage trips, collections, deliveries, and invoicing from the road — built to stay usable with weak or intermittent connectivity.

Consumes the [FrutraQ-Backend](https://github.com/Juangxlvis/FrutraQ-Backend) REST API.

## Tech Stack

- **Angular 22** — standalone components, zoneless change detection, signals
- **Angular Material 3**
- **@angular/pwa** — installable app shell with an offline-capable service worker
- **TypeScript**, **RxJS**

## Architecture & Key Decisions

- **`core/` / `features/` / `shared/`** module structure: app-wide singletons (auth, HTTP client wrapper, guards, interceptors) in `core/`; one folder per business module in `features/`; reusable UI pieces in `shared/`.
- **JWT authentication with silent refresh**: an HTTP interceptor attaches the access token to every outgoing request. On a `401`, it transparently exchanges the refresh token for a new access token and retries the original request once — the user only sees a redirect to `/login` if the refresh token itself has also expired.
- **Route-level guard** protects the entire authenticated section of the app in one place (applied to the parent `Shell` route), rather than being repeated per screen.
- **`ApiService`** centralizes the API base URL and generic HTTP verbs so feature services never hardcode endpoints.
- **Signals over Zone.js**: component state (`loading`, `error`, filtered lists) is expressed with `signal()`/`computed()`, in line with Angular's zoneless direction.
- **Mobile-first, Material-only UI**: no custom-built components — every interactive element uses Angular Material, sized for touch (56px minimum targets) and legible in direct sunlight, per the target user (a driver checking the app in the field).

## Getting Started

```bash
git clone https://github.com/Juangxlvis/FrutraQ-Frontend.git
cd frutraq-frontend
npm install
ng serve
```

App available at `http://localhost:4200`. Requires the [backend](https://github.com/Juangxlvis/FrutraQ-Backend) running locally at `http://127.0.0.1:8000`.

## Building & Testing the PWA

The service worker is intentionally disabled in `ng serve` (development) to avoid caching stale builds. To test installability and offline behavior:

```bash
ng build
npx http-server dist/frutraq-frontend/browser -p 8080
```

Then open `http://localhost:8080` and check Chrome DevTools → Application → Service Workers / Manifest.

## Project Status

In active development (Phase 2 of the project). Completed so far: project scaffolding, Angular Material, PWA configuration, JWT auth flow with automatic token refresh, and the main trips list screen. Remaining: trip creation/detail forms, invoicing module, and reporting dashboard.

## License

Private project — not licensed for public reuse.
