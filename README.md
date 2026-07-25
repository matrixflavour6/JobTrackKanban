# JobTrack Kanban Pro

A privacy-focused, drag-and-drop Kanban board for tracking job applications — status stages, follow-up reminders, analytics, and JSON/CSV export. Runs entirely client-side; your data stays in your browser's local storage.

**License:** Commercial edition, unlocked with a Gumroad license key.
Purchase: https://matrixflavour.gumroad.com/l/job-tracker-kanban

## Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

Output goes to `dist/`.

## Deploy to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys automatically on every push to `main`.

**One-time setup:**
1. Push this repo to GitHub as `JobTrackerKanban`.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Push to `main` (or run the workflow manually from the **Actions** tab).

Your site will be published at `https://<your-username>.github.io/JobTrackerKanban/`.

No environment variables or secrets are required — this is a fully static app.
