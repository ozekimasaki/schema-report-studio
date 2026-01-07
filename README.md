# Structured Data Report Studio

Batch extract JSON-LD from URLs and export a client-ready report (HTML or PDF via print).

## Stack
- Client: Vite 7 + React
- Server: Hono (Node)

## Setup

Open two terminals.

### Server
```
cd server
npm install
npm run dev
```

### Client
```
cd client
npm install
npm run dev
```

Client runs on http://localhost:5173
Server runs on http://localhost:8787

## Cloudflare Workers (front + API)
1. Build the client:
```
cd client
npm install
npm run build
```
2. Run Workers locally:
```
cd ../server
npm install
wrangler dev
```
3. Deploy:
```
wrangler deploy
```

## Usage
1. Paste URLs (one per line).
2. Click "Extract structured data".
3. Choose a report template, then export JSON/CSV/HTML or "Export PDF" (opens print dialog).

## Notes
- JSON-LD only (microdata and RDFa are not parsed).
- For PDF, use the Print dialog and choose "Save as PDF".
- Default limit: 200 URLs per request.
