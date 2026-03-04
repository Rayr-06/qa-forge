# 🚀 How to Push QA Forge to GitHub and Go Live

Complete step-by-step guide. Follow in order.

---

## Step 1 — Create the GitHub Repository

1. Go to **github.com/Rayr-06**
2. Click the **+** button → **New repository**
3. Repository name: `qa-forge`
4. Description: `AI-powered test case generation for slot game QA teams`
5. Set to **Public**
6. Do NOT initialise with README (we have our own)
7. Click **Create repository**

---

## Step 2 — Unzip and Set Up Locally

1. Unzip `qa-forge-repo.zip` to a folder on your computer
2. Open a terminal (PowerShell on Windows / Terminal on Mac)
3. Navigate to the unzipped folder:
   ```
   cd path/to/qa-forge-demo
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Run locally to test it works:
   ```
   npm run dev
   ```
6. Open `http://localhost:5173` — you should see QA Forge

---

## Step 3 — Push to GitHub

In your terminal (inside the qa-forge-demo folder):

```bash
git init
git add .
git commit -m "Initial commit — QA Forge v1.0"
git branch -M main
git remote add origin https://github.com/Rayr-06/qa-forge.git
git push -u origin main
```

It will ask for your GitHub username and password.
For password, use a **Personal Access Token** (not your actual password):
- Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Generate New Token
- Give it `repo` permissions
- Use that token as your password

---

## Step 4 — Enable GitHub Pages (Auto Deploy)

1. Go to your repo: **github.com/Rayr-06/qa-forge**
2. Click **Settings** tab
3. Scroll to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The deploy workflow (`.github/workflows/deploy.yml`) will run automatically on every push

Wait 2–3 minutes after your first push. Your site will be live at:

**https://rayr-06.github.io/qa-forge**

---

## Step 5 — Verify It's Live

1. Go to the **Actions** tab in your repo
2. You should see a workflow called "Deploy QA Forge to GitHub Pages" running
3. Once it shows a green checkmark ✅, your site is live
4. Visit **https://rayr-06.github.io/qa-forge**

---

## Step 6 — Share With Clients

Send clients this message:

> "Hi [name], here's a live demo of QA Forge — our AI-powered test case generation platform.
> No setup needed, just open the link and click 'Try Demo':
> **https://rayr-06.github.io/qa-forge**
>
> If you'd like to try it with your own spec and live AI, you can enter an Anthropic API key in the top bar.
> Happy to walk you through it — let me know."

---

## Giving Clients Access to the Private Full Version

If you want to give a specific client access to a private repo:

1. Create a separate private repo: `qa-forge-full`
2. Go to Settings → Collaborators → Add People
3. Enter their GitHub username or email
4. They'll get an invitation to access the full version

---

## Keeping It Updated

Every time you push new code to `main`, GitHub Pages auto-deploys:

```bash
git add .
git commit -m "Update: [what you changed]"
git push
```

Done. Live in 2–3 minutes.

---

## Quick Reference

| URL | Purpose |
|-----|---------|
| `https://rayr-06.github.io/qa-forge` | Public demo for clients |
| `https://github.com/Rayr-06/qa-forge` | Source code repo |
| `http://localhost:5173` | Local development |

---

Built by Adithya Sharma · github.com/Rayr-06
