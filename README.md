# ทั่วไปหรือ Deductible

เลือกประกันสุขภาพแบบทั่วไปหรือ Deductible ดี?

Compare premiums, analyze opportunity cost, and simulate real-world claim scenarios — all in one interactive tool.

## Features

- **Premium comparison** — side-by-side standard vs deductible plans with real 2026 market data from MTL, AIA, and Chubb Life
- **Opportunity cost analysis** — compound interest projections over 5 and 10 years with adjustable return rate
- **TVM toggle** — switch between raw principal and time-value-of-money calculations
- **Protection Matrix** — 3-scenario risk/payout analysis (frequent minor illness, healthy, major illness)
- **Scenario Simulator** — compare claim outcomes across 3 plan types with selectable scenarios
- **Usage-pattern guide** — decision helper based on claim frequency and cost per visit
- **Custom sliders** — animated thumb with smooth CSS transitions, dual-rate controls
- **Custom dropdown** — native-select replacement with click-outside handling

## Data Sources

| Provider | Plan |
|---|---|
| MTL (เมืองไทยประกันชีวิต) | D Health Plus, D Health Lite |
| AIA (เอไอเอ) | AIA Health Happy |
| Chubb Life (ชับบ์ไลฟ์) | Health Premium Extra Deductible (HPED) |

*Premiums are market averages under New Health Standard (2026). Actual rates vary by underwriting.*

## Tech

- HTML, Tailwind CSS, vanilla JS
- [DiceBear](https://dicebear.com) deterministic avatars (lorelei, adventurer, bottts, fun-emoji)
- Sarabun typeface (Thai + Latin)
- [@vercel/og](https://vercel.com/docs/functions/og-image-generation) for dynamic social preview images
- Playwright for headless testing

## Deploy

```bash
vercel
```

## Test

```bash
npm install
node test.mjs
```
