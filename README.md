# WoodNext landing page

Landing page for ads (Meta / Instagram). Visitors browse Bed, Kitchen and Door designs; each product has a
**Get Price** button that opens WhatsApp (+92 319 2304193) with the selected product and its details pre-filled.

Built with Next.js (App Router) + TypeScript. No database or API keys needed.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

## Edit content

| What | Where |
| --- | --- |
| Brand name, WhatsApp number, phone | `lib/site.ts` |
| Products, categories (tabs) and videos | the `/admin` panel (stored in `data/catalog.json`) |
| Colors, spacing, layout (light + dark theme) | `app/globals.css` |

Product images can be a remote Unsplash URL or your own photo in `public/products/` (e.g. `"/products/bed-1.jpg"`).

## Owner panel (/admin)

Only the owner can log in. Customers never see it. From the panel you can add, edit, delete and re-order:

- **Products** in any category (photo upload or image link),
- **Categories** (these are the site navigation: navbar, hero tabs, category tiles, footer), so a new "Chairs" tab appears everywhere with its own products,
- **Videos** (upload to YouTube, paste the link; they show in the "See our work" section).

Data lives in `data/catalog.json` (photos in `data/uploads/`).

### Set up the login

Add these environment variables (locally in `.env.local`, on Vercel under Settings, Environment Variables):

| Variable | What |
| --- | --- |
| `ADMIN_USERNAME` | Owner username |
| `ADMIN_PASSWORD` | Owner password (use a long one) |
| `SESSION_SECRET` | Random text, 32+ characters (signs the login cookie) |

Then open `/admin`. Without these the login stays disabled (there is no default password).

### Saving on Vercel

Vercel can't write files, so on Vercel the panel saves by committing `data/catalog.json` to this GitHub repo, which redeploys the site (live about a minute after each save). Add:

| Variable | What |
| --- | --- |
| `GITHUB_TOKEN` | A fine-grained token with **Contents: Read and write** on this repo only |
| `GITHUB_REPO` | `owner/repo`, for example `Sharjeel-Rajput-143/woodnext` |
| `GITHUB_BRANCH` | Optional, defaults to `main` |

Without them, Vercel shows the panel read-only. Running the site yourself (`npm run dev` / `npm start`) saves straight to the file.


## Ad tips

- Deep link to a category: `https://your-site.com/?tab=kitchen` (`bed`, `kitchen` or `door`).
- `utm_*` / `fbclid` parameters are added to the WhatsApp message as `Came from: ...`.
- If the Meta Pixel is installed, every Get Price click fires a `Contact` event.

## Deploy on Vercel

Import the repo in Vercel (no settings needed). Optional env var `NEXT_PUBLIC_SITE_URL` = your live URL.
