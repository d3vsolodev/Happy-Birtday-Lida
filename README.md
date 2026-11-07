# Happy Birthday Lida 🌸

A birthday website for **Lida** (22 November), built with love by **TH3AN**.

| Page | What it is |
|------|-----------|
| `/` | Opening cake animation, home page, the card, a 💌 love note |
| `/love-letter` | An envelope with 8 draggable love letters |
| `/flower` | A real 3D rose (three.js). Drag to turn it 360°, pinch/scroll to zoom |
| `/wish` | A real 3D cake with candles, 360° view, countdown. She blows out the candles, types a wish, and **it is sent to you** |

Works on phones, tablets, iPad, laptops and desktops. Name, sender and birthday live in `src/config.js`.

## Run locally
```bash
npm install
npm run dev          # site only, http://localhost:5173 (the wish backend needs Vercel, see below)
npm run build        # production build
npm run test:api     # offline test of the wish backend
npx vercel dev       # site + backend together (needs the env vars below in .env.local)
```

## Make it hers
- Her photo: replace `src/assets/lida.jpg` (keep the file name)
- Name / birthday: `src/config.js`
- Card message: `src/components/BookCanvas.jsx` · Love letters: `lettersData` in `src/pages/LoveLetter.jsx` · 💌 note: `src/components/LoveNote.jsx`

## Deploy: GitHub + Vercel
1. Push this folder to a GitHub repo (it can be public or private).
2. vercel.com → **Add New → Project** → import the repo → Deploy. (`vercel.json` is ready; the `api/` folder becomes the backend automatically.)

## Receive her wishes (backend)
When Lida sends a wish, `api/wish.js` does two things:
- **Stores it in GitHub** as a new Issue in a repo you choose (GitHub also notifies you by email / mobile app).
- **Optionally pings you on Telegram** instantly.

Set it up once:
1. **Create a PRIVATE repo** on GitHub, e.g. `lida-wishes` (private matters: Issues in a public repo can be read by anyone).
2. **Create a token:** GitHub → Settings → Developer settings → *Fine-grained tokens* → Generate.
   Repository access: **Only select repositories → lida-wishes**. Permissions → **Issues: Read and write**.
3. In your repo `lida-wishes` click **Watch → All activity** so you get a notification for every wish.
4. *(Optional, instant alert)* On Telegram message **@BotFather** → `/newbot` → copy the token. Send any message to your new bot, then open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `chat` → `id`.
5. In Vercel: **Project → Settings → Environment Variables**, add (see `.env.example`):
   `GITHUB_REPO` (e.g. `TH3AN/lida-wishes`), `GITHUB_TOKEN`, and optionally `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
6. **Redeploy** (Deployments → ⋯ → Redeploy). Then open `/wish` on your site, blow out the candles, send a test wish, and check your repo's Issues.

Safety built in: the token only exists on the server, wishes are limited to 300 characters, there is a hidden bot trap, a per-visitor rate limit, and requests from other websites are rejected.

> The page tells her honestly that **you will receive her wish**. Keep it that way: it is her message, and she should know where it goes.
