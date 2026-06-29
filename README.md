# Sora 2 Playground

A clean, minimal web app for creating videos with OpenAI's **Sora 2** models. Write a prompt, tweak a few optional settings, and generate a video — then preview, download, remix, and track everything (including cost) in one place. You bring your own OpenAI API key; it stays in your browser.

## How to use the demo

1. **Add your OpenAI API key.** On first load the app asks for your key. Paste a key that starts with `sk-`. It's stored only in your browser's local storage and is never sent to any server other than OpenAI. Your organization must have access to the Sora 2 API (currently a limited beta).
2. **Write a prompt.** Use the large prompt box to describe your scene. For best results, mention the **shot type, subject, action, setting, lighting, and camera movement** in one concise description.
3. **Try a starter prompt (optional).** Click **Cinematic nature**, **Cozy close-up**, or **Aerial coastline** to load a ready-made, best-practice prompt you can edit. The [Sora 2 prompting guide](https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide) link is right above the chips.
4. **Adjust video settings (optional).** Expand **Video settings** to change:
   - **Model** — Sora 2 or Sora 2 Pro
   - **Size** — 720p portrait/landscape (1080p is Sora 2 Pro only)
   - **Duration** — 4, 8, or 12 seconds
   - **Input reference** — an optional image or video to use as the first frame (must match the selected resolution)

   The collapsed bar shows your current choices at a glance, e.g. `Sora 2 • 720x1280 • 4s`.
5. **Generate.** Click **Create Video**. The job is queued and you can keep working or queue more videos while it processes. Progress appears in the **Video output** panel.
6. **Review the result.** When it's ready, play it in the output panel with the built-in controls and progress slider. From there you can:
   - **Download** the video to your device
   - **Send to remix** to make a targeted change with a new prompt
   - **Click the prompt** to copy its full text
7. **Browse history.** Every generation appears under **History** at the bottom — hover a thumbnail to preview, click to reopen it, click the **$** badge for a cost breakdown, or delete items you no longer need. A running **total cost** is shown next to the History title.

> **Note:** Videos and history live in your browser (IndexedDB + local storage). Clearing your browser data or using a different device/browser starts fresh.

## Run it locally

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- An OpenAI API key with Sora 2 access

### Steps

```bash
# 1. Clone
git clone https://github.com/msajid/sora-2-playground.git
cd sora-2-playground

# 2. Install
npm install

# 3. Configure (optional for browser-key mode)
cp .env.local.example .env.local

# 4. Start
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and add your API key when prompted.

### Modes

The app runs in one of two modes:

| Mode | API key | Best for |
| --- | --- | --- |
| **Frontend (default here)** | Entered in the browser by each user | Public/shared demos — set `NEXT_PUBLIC_ENABLE_FRONTEND_MODE=true` |
| **Backend** | Stored server-side via `OPENAI_API_KEY` | Personal/team use you control; supports an optional `APP_PASSWORD` |

To build a static, browser-only bundle (for GitHub Pages, Netlify, S3, etc.):

```bash
npm run build:frontend   # output in ./out
```

## Tech

Next.js 15 · React 19 · Tailwind CSS 4 · Radix UI — styled with a Microsoft Fluent-inspired theme.

