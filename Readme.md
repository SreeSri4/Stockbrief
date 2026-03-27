# StockBrief AI 📈

AI-powered stock research reports in seconds. Enter any ticker (NSE, BSE, NASDAQ, NYSE, etc.) and get a comprehensive research brief powered by Claude + live web search.

## Project Structure

```
stockbrief/
├── index.html          # Frontend UI
├── api/
│   └── research.js     # Vercel Edge Function (Anthropic API proxy)
├── vercel.json         # Vercel routing config
├── .gitignore
└── README.md
```

## Deploy to Vercel (Step-by-Step)

### 1. Create a GitHub Repository

```bash
# In this project folder
git init
git add .
git commit -m "Initial commit: StockBrief AI"
```

Go to https://github.com/new and create a new repo called `stockbrief`.  
Then push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/stockbrief.git
git branch -M main
git push -u origin main
```

### 2. Connect to Vercel

1. Go to https://vercel.com and sign in (use "Continue with GitHub")
2. Click **"Add New Project"**
3. Import your `stockbrief` GitHub repository
4. Framework Preset: **Other** (no framework needed)
5. Root Directory: leave as `/`

### 3. Add Your Anthropic API Key

In the Vercel project setup screen (or later in Project → Settings → Environment Variables):

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...your key...` |

Get your API key from: https://console.anthropic.com/

### 4. Deploy

Click **"Deploy"** — Vercel will build and deploy in ~30 seconds.  
Your app will be live at `https://stockbrief.vercel.app` (or similar).

---

## Local Development

```bash
npm install -g vercel
vercel dev
```

Create a `.env.local` file:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Then open http://localhost:3000

---

## How It Works

1. User enters a ticker (e.g. `NSE:SBILIFE`, `AAPL`, `TSLA`)
2. Frontend sends a POST to `/api/research`
3. The Edge Function (server-side) calls the Anthropic API with **web search enabled**
4. Claude searches the web for live market data, financials, analyst ratings
5. Returns structured JSON → rendered into a full research report

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (no framework needed)
- **Backend**: Vercel Edge Function
- **AI**: Claude Sonnet (Anthropic) + Web Search tool
- **Hosting**: Vercel (free tier works fine)
