# ⚡ QA Forge — Intelligent QA Workbench for Slot Games

> **Upload a spec. Get a complete, production-ready test suite in minutes — not days.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Claude](https://img.shields.io/badge/Powered%20by-Claude%20AI-6B3FA0)](https://anthropic.com)

---

## What Is QA Forge?

QA Forge is an AI-powered test case generation platform built specifically for **slot game QA teams**.

Born from a real problem: a team of **30 QA engineers** writing test cases in 30 different formats, at 30 different depths, with no consistent structure that could be passed down or built upon. Every sprint, starting from scratch.

QA Forge solved that. One spec in. One complete, consistent, professional test suite out.

---

## The Problem It Solves

| Before QA Forge | After QA Forge |
|---|---|
| 3–5 days writing test cases per feature | Complete suite in under 1 hour |
| Each engineer writes differently | One consistent format, every time |
| Only happy path gets tested | 13 test categories as standard |
| Spec gaps found during testing | Clarifying questions catch gaps upfront |
| Bugs shipped with no test case | Gap detection closes the loop on every bug |
| "Are we ready to release?" — nobody knows | Live coverage dashboard answers in real time |

---

## Key Features

- **Spec Analysis** — Upload PDF, DOCX, TXT. Detects features, EOS config, queue logic, risk areas, and clarifying questions automatically
- **13 Test Types** — Functional, Negative, Spam/Stress, UI/Art, Queue Priority, EOS Config, Edge Case, Regression, Vertical Machine, RTL Dialog, Audio, Platform, Performance
- **"What Wrong Looks Like"** — Every test case has a Negative Scenario field telling QA exactly what failure looks like
- **User Context Layer** — Inject feature history, interconnections, known fragile areas, previous bugs
- **Bug Writer + Gap Detection** — Write a bug, get a formal report, automatically detect missing test coverage
- **Coverage Dashboard** — Live P1/P2/P3 breakdown, coverage %, risk hotspots, QA days estimate
- **Export Everywhere** — CSV, JSON, XML, JIRA-ready, TestRail-ready

---

## Live Demo

👉 **[Try it at rayr-06.github.io/qa-forge](https://rayr-06.github.io/qa-forge)**

No setup. No API key needed for demo mode. Full interactive workflow using a generic slot game feature spec.

To use with your own spec and live AI:
1. Open the demo
2. Paste your spec or upload a file
3. Enter your Anthropic API key (top bar)
4. Analyse → Generate

---

## Run Locally

```bash
git clone https://github.com/Rayr-06/qa-forge.git
cd qa-forge
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Tech Stack

React 18 · Vite · Claude claude-sonnet-4 API · DM Mono + Syne fonts · Zero UI dependencies

---

## Built By

**Adithya Sharma** — Game QA Engineer · Mobile Automation · Founder @ RAYR

Built by a QA team, for QA teams. We are not developers. We built this anyway because the problem was worth solving.

> *"QA Forge handles the writing. Your team handles the thinking."*

[LinkedIn](https://linkedin.com/in/adithya-sharma-qa-engineer) · [GitHub](https://github.com/Rayr-06) · sharmaadithya1995@gmail.com

MIT License
