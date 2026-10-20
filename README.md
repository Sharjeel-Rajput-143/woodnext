# WoodNext landing page

Landing page for ads (Meta / Instagram). Visitors browse Bed, Kitchen and Door designs; each product has a
**Get Price** button that opens WhatsApp (+92 345 5096301) with the selected product and its details pre-filled.

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

### Login

The owner login is built in (username `Waqar`; the password is stored only as a hash in `lib/credentials.ts`).
Open `/admin` to sign in. The login comes from the first of these that exists:

1. **A password set from the panel** (saved as hashes in `data/auth.json`). Wins over everything below.
2. `ADMIN_USERNAME` / `ADMIN_PASSWORD` environment variables.
3. The built-in login.

Set `SESSION_SECRET` (random text, 32+ characters) in the hosting settings so login cookies can't be forged.

**Change password.** Signed in, open **Account** in the sidebar: enter the current password and a new one (10+ characters).
Other devices are signed out.

**Forgot password.** The login page has a **Forgot password?** link. It asks for the username, the **recovery key** and a new
password. The owner creates the recovery key once from **Account → Recovery key** (it is shown only once, so write it down).
Each recovery key works once; resetting the password shows a fresh one. There is no email step, so a lost password *and* lost
recovery key means someone with hosting access has to reset the login: delete `data/auth.json` (on Vercel: delete it from the
GitHub repo) to go back to the environment variables / built-in login, or set a new password in `ADMIN_PASSWORD`.

On Vercel the new password is saved by committing `data/auth.json` to the GitHub repo (the same `GITHUB_TOKEN` as for products,
see below), so keep that repo **private**: it holds password hashes. Without `GITHUB_TOKEN` the Account page is read-only.

### Saving on Vercel

Vercel can't write files, so on Vercel the panel saves by committing `data/catalog.json` to this GitHub repo, which redeploys the site (live about a minute after each save). Add:

| Variable | What |
| --- | --- |
| `GITHUB_TOKEN` | A fine-grained token with **Contents: Read and write** on this repo only |
| `GITHUB_REPO` | Optional. Defaults to `Sharjeel-Rajput-143/woodnext` |
| `GITHUB_BRANCH` | Optional, defaults to `main` |

Without them, Vercel shows the panel read-only. Running the site yourself (`npm run dev` / `npm start`) saves straight to the file.


## Ad tips

- Deep link to a category: `https://your-site.com/?tab=kitchen` (`bed`, `kitchen` or `door`).
- `utm_*` / `fbclid` parameters are added to the WhatsApp message as `Came from: ...`.
- If the Meta Pixel is installed, every Get Price click fires a `Contact` event.

## Deploy on Vercel

Import the repo in Vercel (no settings needed). Optional env var `NEXT_PUBLIC_SITE_URL` = your live URL.

> Saving from the owner panel on Vercel needs the `GITHUB_TOKEN` environment variable (see "Saving on Vercel" above).
