# Proposal Studio — Dynamic Proposal Generation System

A full-stack web app that turns form input into professional, downloadable PDF business proposals using three switchable templates, with a live preview before download.

| Layer | Tech | Hosting |
|---|---|---|
| Frontend | Next.js 14 (App Router) + React 18 | Vercel |
| Backend | Node.js + Express | Render (Docker) |
| PDF engine | Puppeteer (headless Chromium) | inside the backend container |

## Features

- Three templates: **Classic** (serif letterhead), **Modern** (gradient cover, numbered sections, visual timeline), **Minimal** (editorial, hairline rules)
- Dynamic fields: company name & logo upload, client details, project description, scope of work, pricing table (qty × unit price, discount, tax, auto totals), timeline phases, terms & conditions, currency (8 supported), accent colour
- **Live preview** (debounced) rendered from the *same HTML* that becomes the PDF, so preview and download match
- Downloadable A4 PDFs with page numbers, background colours, and pagination rules (rows, timeline items and signature blocks never split across pages; the cost table stays together)
- Server-side validation (zod), HTML escaping of all user input, request interception in Chromium so user content cannot trigger outbound requests, rate limiting, CORS allow-list
- Responsive UI: two-pane on desktop, Edit/Preview tabs on mobile

## Architecture

```
Browser (Next.js)                         Backend (Express on Render)
┌───────────────────┐   POST /api/preview ┌──────────────────────────────────┐
│ ProposalForm      │ ──────────────────► │ validate (zod)                   │
│ TemplatePicker    │ ◄── HTML ────────── │ renderProposal(data) ─ template  │
│ Preview (iframe)  │                     │   classic | modern | minimal     │
│                   │   POST /api/generate│ htmlToPdf(html) ─ Puppeteer      │
│ Download button   │ ──────────────────► │   shared Chromium, 1 page/request│
└───────────────────┘ ◄── application/pdf └──────────────────────────────────┘
```

```
proposal-system/
├── backend/
│   ├── server.js                 # Express app, routes, CORS, rate limit
│   ├── src/
│   │   ├── validate.js           # zod schema for the proposal payload
│   │   ├── pdf.js                # Puppeteer service (shared browser, concurrency cap)
│   │   ├── sample.js             # sample payload
│   │   └── templates/
│   │       ├── index.js          # template registry
│   │       ├── shared.js         # escaping, totals, section builders, base CSS
│   │       ├── classic.js  modern.js  minimal.js
│   ├── scripts/generate-samples.js
│   ├── Dockerfile  .env.example
├── frontend/
│   ├── app/ (layout, page, globals.css)
│   ├── components/ (ProposalForm, TemplatePicker, Preview)
│   └── lib/ (api, defaults, image)
├── samples/                      # example PDFs, one per template
├── render.yaml                   # Render blueprint
└── README.md
```

### API

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check (used by Render and to wake the free tier) |
| GET | `/api/templates` | Template metadata |
| GET | `/api/sample` | Sample payload |
| POST | `/api/preview` | JSON → HTML preview |
| POST | `/api/generate` | JSON → PDF (`application/pdf`, attachment) |

Payload shape (abridged):

```json
{
  "template": "classic | modern | minimal",
  "company": { "name": "", "logo": "data:image/png;base64,…", "email": "", "phone": "", "address": "", "website": "" },
  "client":  { "name": "", "company": "", "email": "", "phone": "", "address": "" },
  "proposal": { "title": "", "date": "2026-11-01", "validUntil": "2026-12-01", "currency": "USD", "accentColor": "#1d4ed8" },
  "description": "", "scope": "one item per line",
  "items": [{ "description": "", "qty": 1, "unitPrice": 100 }],
  "taxRate": 18, "discount": 5,
  "timeline": [{ "phase": "", "duration": "", "details": "" }],
  "terms": "one term per line"
}
```

## Local setup

Requirements: Node 18+ (20 recommended), Git.

```bash
# 1. Backend
cd backend
cp .env.example .env
npm install            # downloads Chromium for Puppeteer (~170MB)
npm run dev            # http://localhost:4000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev            # http://localhost:3000
```

Open http://localhost:3000, click **Load sample data**, switch templates, then **Download PDF**.

Regenerate the sample PDFs: `cd backend && npm run samples` (writes to `../samples`).

> If Chromium cannot be downloaded (corporate proxy), install Chrome and set `PUPPETEER_EXECUTABLE_PATH` in `backend/.env`.

## Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "feat: proposal generation system"
git branch -M main
git remote add origin https://github.com/<you>/proposal-system.git
git push -u origin main
```

### 2. Backend → Render

Puppeteer needs system libraries that Render's native Node runtime doesn't provide, so the backend ships a **Dockerfile** (installs Chromium + fonts).

1. Render dashboard → **New + → Blueprint** → select the repo (uses `render.yaml`), *or* **New + → Web Service** → runtime **Docker**, root directory `backend`.
2. Set env var `ALLOWED_ORIGINS` to your Vercel URL (you can fill this in after step 3), e.g. `https://proposal-studio.vercel.app`.
3. Health check path: `/health`. Deploy and note the URL, e.g. `https://proposal-backend.onrender.com`.

### 3. Frontend → Vercel

1. Vercel → **Add New → Project** → import the repo, set **Root Directory** to `frontend`.
2. Add env var `NEXT_PUBLIC_API_URL` = your Render URL (no trailing slash).
3. Deploy. Then return to Render and set `ALLOWED_ORIGINS` to the final Vercel URL and redeploy/restart.

### 4. Verify

- `https://<render-url>/health` returns `{"status":"ok"}`
- Open the Vercel URL → Load sample data → preview appears → Download PDF works for all 3 templates.

**Free-tier note:** Render's free web services sleep after ~15 minutes idle; the first request can take 30–60s. The frontend pings `/health` on page load to wake it and shows the server status in the header. Use a paid instance (or an uptime pinger) for demos where cold starts matter.

## Technical decisions

- **HTML/CSS templates + Puppeteer** rather than a low-level PDF library: real CSS layout (grid, flex, gradients), pixel-faithful output, easy template authoring, and a free live preview since the preview *is* the template HTML.
- **Shared section builders, template-specific CSS and headers**: all templates use the same data model and semantic markup; layout and personality come from each template's stylesheet, which keeps templates small and consistent. Adding a template = one file + one registry line + one id in `validate.js`.
- **One shared Chromium instance**, a fresh page per request, closed in `finally`, with a concurrency cap (`MAX_CONCURRENT_PDFS`) so bursts can't exhaust memory on small instances.
- **Security**: all values HTML-escaped; logos accepted only as validated image data URLs; Chromium request interception blocks every non-`data:` request (no SSRF through user content); iframe preview is sandboxed; helmet, rate limit, CORS allow-list, body size limit.
- **Logo handling**: uploads are downscaled client-side to ≤480px and sent as base64, so no file storage is needed and the backend stays stateless.
- **Currency/formatting** use `Intl.NumberFormat` (INR uses Indian digit grouping).

## Possible extensions

User accounts and saved proposals (database), e-signature, email delivery, more templates, i18n, a template-level custom font picker.

## Sample output

`samples/sample-classic.pdf`, `sample-modern.pdf`, `sample-minimal.pdf` — generated from the sample payload in `backend/src/sample.js`.
