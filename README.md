# Export Control Compliance Agent

AI-powered web app that validates export control contracts against an EC Compliance Policy using Google's Gemini Flash Lite.

**Live demo:** [fmachta.github.io/ec-compliance-agent](https://fmachta.github.io/ec-compliance-agent)

## How It Works

1. Enter your Gemini API key (stored in browser memory only, cleared on tab close)
2. Upload an export control contract (PDF)
3. The app parses the contract, chunks it into clauses, and sends each clause to Gemini with the compliance policy as context
4. Gemini flags non-compliant clauses with severity ratings, explanations, and suggested rewrites
5. Chat interface lets you ask follow-up questions about specific violations

## Architecture

- **100% client-side** — React + Vite + Tailwind CSS
- **PDF parsing** — pdf.js in the browser
- **LLM analysis** — Gemini Flash Lite via Google AI REST API (direct from browser)
- **Hosting** — GitHub Pages (free static hosting)
- **State** — all in React memory; no backend, no database

## Mock Data

`mock-data/` contains synthetic contracts and a compliance policy for testing:

| # | Contract | Key Issues |
|---|----------|------------|
| 1 | Dual-Use FPGA Export | No license, missing end-use statement, restricted destination |
| 2 | Encryption Software | No ECCN 5D002, no CCATS, no encryption registration |
| 3 | Defense Article Re-export | No DSP-5, missing ITAR disclosure, no DDTC authorization |
| 4 | Commercial Office Furniture | Clean baseline — no violations |
| 5 | Deemed Export Contractor | Foreign national accessing controlled tech without TCP |

## Local Development

```bash
npm install
npm run dev        # Vite dev server at localhost:5173
```

## Deploy

Push to `main` branch. GitHub Pages serves from `/docs` or the repo root.
