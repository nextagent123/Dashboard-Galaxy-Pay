# Galaxy Pay — Báo cáo Khối Kinh doanh (web)

Next.js (App Router) implementation of the `Galaxy Pay Dashboard.dc.html` design
handed off from Claude Design (see `../project/` for the original prototype and
`../chats/` for the design conversation history).

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Structure

- `app/(dashboard)/` — one route per report page (`/`, `/company`, `/khoi`,
  `/pipeline`, `/sp`, `/kpi`, `/ota`, `/gd`, `/thang`, `/bhxh`). The route
  group's `layout.js` owns the auth gate, sidebar, and top-right user badge.
- `components/` — shared UI (`ui/`) and SVG chart primitives (`charts/`),
  plus `AuthProvider`, `Sidebar`, `LoginScreen`, `UserAdminModal`.
- `lib/data.js` — every static dataset from the prototype (targets/actuals,
  pipeline, products, BDM/personal KPI, OTA, Loa), transcribed verbatim.
- `lib/metrics.js` — pure derived calculations (percentages, runrate, table
  rows) that mirror the prototype's logic 1:1. No JSX/SVG here — charts read
  plain numbers from these functions and build their own markup.
- `lib/auth.js` — client-side prototype auth (SHA-256 hashed passwords in
  localStorage). **Not secure** — same caveat the original design carried:
  anyone with devtools access to the browser can read the user list and
  hashes. Fine for an internal, low-stakes gate; not for anything sensitive.

## Swapping in real data later

Everything on every page reads through the functions in `lib/metrics.js`,
which in turn only touch the constants in `lib/data.js`. To move off the
bundled static numbers:

1. Replace the contents of `lib/data.js` with a fetch (API route, CMS, Google
   Sheet, whatever the real source ends up being).
2. If the source is async, the simplest path is a server component that
   fetches the data and passes it as props into the existing page components
   (which currently call `getHome()`, `getKhoiKpi()`, etc. directly) — or add
   a small data-loading hook if you want client-side refresh/polling like the
   original prototype's "Làm mới" button.

The prototype also had a live Google Sheets fetch (`gviz` endpoint) for the
"KPI Khối Kinh doanh" page with a daily auto-refresh and an offline fallback;
that was intentionally left out of this build per the current data-import
plan — the seam above is where it would plug back in.

## Known gaps vs. the design

- **Báo cáo tháng** and **Báo cáo Dịch vụ BHXH** are placeholder "coming
  soon" pages — they were never actually designed in the source chats (no
  page content exists anywhere for them).
- Two small rendering bugs present in the original prototype were fixed
  rather than reproduced: overlapping SLGD/GTGD labels on short bars in the
  OTA comparison chart, and stray "loa"/"KH" text on empty months in the Loa
  detail table.
