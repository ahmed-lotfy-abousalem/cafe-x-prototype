# Café X: QR Self-Ordering Prototype

Clickable prototype of the system in `../cafe-ordering-system-architecture.md`, built to win client approval.
Every screen works. Data is sample data kept in the browser, with no backend.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Open `http://localhost:3000`. The hub page links to every module and includes a 5-minute demo script.

**Live sync:** orders, status changes and sold-out toggles sync instantly between tabs/windows of the same browser.
Use **Side-by-side demo** on the hub, or open the guest menu and the staff board in two windows.

**Phone demo:** run `npm run dev -- -H 0.0.0.0` and open `http://<your-LAN-IP>:3000` on the phone,
or deploy to Vercel. Note that the phone and the laptop do not share data, because there is no backend yet.
For a live phone → laptop demo, use two windows on the laptop.

**Staff login:** pick any person, and any 4-digit PIN works. **Reset:** use the hub's *Reset* button or Admin → Settings → Reset demo data.

## Screens

| Area | Route | Highlights |
|---|---|---|
| Hub / pitch page | `/` | Module launcher, QR for Table 7, demo script |
| Link tree | `/l/cafe-x?t=<token>` | Branding, open-now status, table chip, Order Now, socials |
| Menu | `/m/cafe-x` | Sticky categories, search, popular carousel, modifiers, notes, sold-out, call waiter / bill, AR/EN + RTL |
| Checkout | `/m/cafe-x/checkout` | Dine-in/takeaway, auto table, name/phone rules, cash/card/online (stub), VAT + service, add to open order |
| Order tracking | `/track?id=…` | Live status stepper, ETA, receipt, call waiter, order history |
| Staff login | `/staff/login` | Role picker + PIN pad |
| Orders board | `/staff` | Kanban, chime + flash on new orders, filters, waiter/bill requests, mark paid, edit/cancel with reason, print ticket, sold-out drawer, *Simulate order* |
| Kitchen display | `/staff/kitchen` | Dark KDS, timers, tick-off lines, bump, all-day count |
| Admin | `/admin/*` | Sales dashboard, orders + CSV export, menu manager (bilingual, photos, modifiers, schedules, CSV import), tables + QR (PNG, print tents, token rotation), link tree editor with live preview, staff & role matrix, settings (tax/service, hours, payments, ordering rules) |

## Assistants (scripted demo)

- **Guest assistant:** the *Ask us* button on the menu and tracking pages. It handles menu questions, allergens, dietary filters, recommendations (category, spicy, "under 150"), pairings, **ordering by chat** ("2 iced spanish latte and a tiramisu" adds them, asks for the table if unknown, then one **Place order** tap sends it to the kitchen, or adds to the guest's open order), order status, waiter/bill requests, Wi-Fi, hours, location and complaints. It answers in English or Egyptian Arabic, depending on what the guest types.
- **Owner assistant:** *Ask your assistant* in Admin. It covers sales (today, yesterday, week, month), top sellers, peak hours, live operations and bilingual description drafts. Sold-out and price changes always show a confirm card first.
- Answers come from live app data via keyword intents (`src/lib/assistant/guest.ts`, `owner.ts`). Unknown questions get suggestion chips, never invented answers.
- **Production swap:** every read/write the bots do lives in `src/lib/assistant/actions.ts`. Expose those functions as Claude Haiku 5.5 tools behind an `/api/chat` route, and the chat UI (`src/components/chat/`) stays the same.

## Code map

- `src/lib/seed.ts`: sample menu (39 items, AR/EN), tables, staff, demo orders, report data
- `src/lib/store.ts`: Zustand stores. `useVenue` is the shared "backend" (localStorage + cross-tab sync); `useDevice` holds per-tab cart, language and staff session
- `src/lib/i18n.ts`: Arabic/English strings and money formatting
- `src/components/ui.tsx`: shared UI kit
- Rebrand: venue name, colours and cover live in Admin → Link tree / Settings. Default theme tokens are in `src/app/globals.css`.

## Production path (not in the prototype)

Supabase (Postgres, Auth, Realtime, Storage) replaces `useVenue`. Server-side price recalculation, real payments
(Paymob/Kashier/Fawry), and WhatsApp/SMS notifications are planned per the architecture doc.
