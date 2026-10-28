# aigilesolutions.com

Source for [aigilesolutions.com](https://www.aigilesolutions.com) — the site for Aigile Solutions, Sarah Blake's AI product consultancy — plus the three interactive demos it links to.

Plain HTML, CSS and vanilla JavaScript. No framework, no build step, no dependencies. Deployed as static files on Vercel.

## What's here

```
index.html              Home page
privacy.html, 404.html  Supporting pages
demo/
  kurrent.html          Interactive demo of Kurrent — a prospecting-intelligence portal for staffing agencies
  impediments.html      Delivery-impediment intelligence: blocked/overrun tickets classified and attributed
  codebase.html         Codebase-intelligence assistant: ask what a system does and how its services connect
  gates.html            The five-stage gated delivery process (static)
src/
  site.js               Home page behaviour (reveal-on-scroll, hero pipeline cycle, contact form, nav state)
  kurrent.js            UI logic for the Kurrent demo
  impediments.js        UI logic for the impediments demo
  codebase.js           UI logic for the codebase demo
data/
  kurrent-data.js       Sample leads, candidates and notes for the Kurrent demo
  impediments-data.js   Sample teams, reasons, evidence, and a seeded generator for ~tickets
  codebase-data.js      Sample service map and role-specific Q&A for the codebase demo
fonts/, img/            Geist / Geist Mono (self-hosted), preview images, share image
vercel.json             Cache headers for fonts and images
```

## The demos

Each demo is a single page that loads its data file, then its logic file, as classic scripts. Everything runs in the browser against the inline sample data — there is no backend, no API calls, and nothing to sign up for.

**Kurrent** (`demo/kurrent.html`) — the front end of a prospecting-intelligence product for staffing agencies. Views: a daily briefing, a pipeline board with lead drawers (notes, candidate shortlist, stage changes), an intel report, an "engine" view that animates the ten pipeline stages with a per-company log, a weekly role planner, analytics, and settings. The engine itself — discovery, dedup, enrichment, contact verification, synthesis — lives in a separate repo; this page models the user-facing portal.

**Impediments** (`demo/impediments.html`) — a dashboard over delivery impediments. Tickets are generated from a seeded PRNG so the numbers are stable between loads. The page filters by sprint range, team and attribution (Internal / Client / Partner / External), renders a reasons breakdown, an attribution trend, a scatter of delay vs cost, and a ticket table with an evidence drawer.

**Codebase** (`demo/codebase.html`) — a chat-style assistant over a mock service map. Pick a role (Sales, Product, Engineering, Support, New hire), ask one of the canned questions, and the answer cites the services it's grounded in and highlights them on the dependency map. Questions outside the indexed set return a fallback rather than a guess.

**Gates** (`demo/gates.html`) — a static page describing a five-stage gated delivery process.

All company names, people, figures and ticket titles in `data/` are invented.

## Running it locally

Any static server works. For example:

```
python3 -m http.server 8080
```

then open `http://localhost:8080`. The `/_vercel/insights/script.js` request on the home page will 404 locally — that's Vercel Analytics, injected only in production.

## Decisions

- **No framework.** Four pages and a few hundred lines of JS didn't justify a build pipeline. The trade-off is that the demos use global functions wired through inline `onclick` handlers rather than modules and event delegation.
- **Data as `.js`, not `.json`.** Loading sample data as a script means the pages also work when opened directly from disk (`file://`), where `fetch()` of a local JSON file would be blocked.
- **Self-hosted fonts.** Geist is served from `/fonts` with long cache headers rather than from a CDN.

## Contact form

The home page's contact form posts to Web3Forms. The `access_key` in `src/site.js` is a public key by design — it identifies the form, it doesn't grant access to anything.
