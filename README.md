# Trend2Short AI

Trend2Short AI is a static MVP that helps creators turn trends into short-form video ideas, hooks, scripts, captions, hashtags, and publishing-ready content blocks.

## Run Locally

1. Open the project folder:
   `C:\Users\LAFRYHIELMOSTAFA\Desktop\Trend2Short-AI`
2. Start a simple local server:
   ```powershell
   cd "C:\Users\LAFRYHIELMOSTAFA\Desktop\Trend2Short-AI"
   python -m http.server 8000
   ```
3. Open:
   `http://127.0.0.1:8000`

You can also open `index.html` directly in a browser, but a local server is recommended for consistent page navigation and testing.

## Deploy On Vercel

1. Push the project to a Git repository or upload it through Vercel.
2. Import the project into Vercel as a static site.
3. Use the default output behavior for static HTML files.
4. Deploy the project. Vercel will serve:
   - `index.html`
   - `about.html`
   - `contact.html`
   - `privacy-policy.html`
   - `terms-of-service.html`

If you keep the included `vercel.json`, clean route aliases such as `/about` and `/contact` can point to their matching HTML files on Vercel.

## Core Files

- `index.html`: main MVP application
- `style.css`: shared design system and page styling
- `script.js`: application logic, LocalStorage state, tabs, history, and dashboard behavior
- `about.html`: about page
- `contact.html`: contact page
- `privacy-policy.html`: privacy page
- `terms-of-service.html`: terms page
- `vercel.json`: simple static routing config for Vercel

