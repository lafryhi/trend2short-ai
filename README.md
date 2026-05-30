# Trend2Short AI

Trend2Short AI is an MVP for turning trends into short-form video ideas, hooks, scripts, captions, hashtags, and CTAs for TikTok, YouTube Shorts, and Instagram Reels.

## Run Locally

1. Open the project folder:
   `C:\Users\LAFRYHIELMOSTAFA\Desktop\Trend2Short-AI`
2. Start a simple local server:
   ```powershell
   cd "C:\Users\LAFRYHIELMOSTAFA\Desktop\Trend2Short-AI"
   python -m http.server 8123
   ```
3. Open:
   `http://127.0.0.1:8123`

Local static serving does not expose the Vercel API route, so the AI Generator falls back to Demo Mode automatically.

## Secure Gemini Setup On Vercel

Trend2Short AI now uses a Vercel Serverless Function at `api/generate.js` for Gemini requests.

Do not place the Gemini key in `config.js`.

1. Import or connect the repository in Vercel.
2. Open the project in Vercel.
3. Go to:
   `Project Settings` -> `Environment Variables`
4. Add:
   `GEMINI_API_KEY`
5. Save the variable.
6. Redeploy the project.

If `GEMINI_API_KEY` is missing, the API route returns Demo Mode and the frontend keeps working with the local fallback generator.

## Frontend Config

`config.js` contains only non-secret frontend settings:

```js
window.APP_CONFIG = {
  API_PROVIDER: "gemini",
  USE_LOCAL_API: false
};
```

`USE_LOCAL_API` can stay `false` for normal static local testing. If you later run a local Vercel environment with API routes, you can set it to `true`.

## Core Files

- `index.html`: main application
- `style.css`: shared styling and responsive layout
- `script.js`: main demo generator, tabs, history, dashboard, and examples wiring
- `js/services/ai.js`: frontend AI service layer with `/api/generate` integration and local fallback
- `js/ai-generator-app.js`: AI Generator UI behavior
- `api/generate.js`: secure Vercel serverless function for Gemini
- `setup.html`: Gemini setup guide
- `vercel.json`: static and API route mappings for Vercel

## Security Notes

- Never commit real API keys to the repository.
- Do not add secrets to `config.js`, `config.example.js`, or any client-side file.
- Keep secrets in Vercel environment variables only.
