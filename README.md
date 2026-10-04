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
| Products (title, description, image, specs) and categories | `lib/products.ts` |
| Colors, spacing, layout (light + dark theme) | `app/globals.css` |

Product images can be a remote Unsplash URL or your own photo in `public/products/` (e.g. `"/products/bed-1.jpg"`).

## Ad tips

- Deep link to a category: `https://your-site.com/?tab=kitchen` (`bed`, `kitchen` or `door`).
- `utm_*` / `fbclid` parameters are added to the WhatsApp message as `Came from: ...`.
- If the Meta Pixel is installed, every Get Price click fires a `Contact` event.

## Deploy on Vercel

Import the repo in Vercel (no settings needed). Optional env var `NEXT_PUBLIC_SITE_URL` = your live URL.
