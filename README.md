# ⚡ Azure Advisor Triage

> A fast, local tool for turning Azure Advisor noise into actionable decisions.

Load an Advisor CSV export, triage every recommendation with a status and notes, and export a clean Excel workbook — all without leaving your machine.

---

## ✨ What it does

Azure Advisor can surface hundreds of recommendations across dozens of subscriptions. This tool helps platform engineers cut through the noise:

- 📋 **Review** recommendations grouped by finding — not by individual resource
- 🏷️ **Triage** each one as **Remediate**, **Dismiss**, or **Exempt**
- 📝 **Annotate** with notes to capture context and decisions ahead of importing into your backlog.
- 📊 **Export** a two-sheet Excel workbook ready for reporting or handoff
  - **Summary** — one row per recommendation, resources collapsed
  - **All Items** — full detail, one row per resource

Your triage decisions are saved in the browser between sessions — re-upload the same CSV at any time and pick up where you left off.

---

## 🛠️ Prerequisites

| Requirement | Minimum version |
|---|---|
| 🟢 [Node.js](https://nodejs.org/) | 18+ &nbsp;*(tested on v22)* |
| 📦 npm | 9+ &nbsp;*(bundled with Node)* |
| 🌐 Browser | Chrome, Edge, or Firefox |

**npm comes bundled with Node.js** — you only need to install Node and you get both.

### Installing Node.js

**Option A — Installer (easiest)**

1. Go to [nodejs.org](https://nodejs.org/) and download the **LTS** version
2. Run the installer and follow the prompts — defaults are fine

**Option B — Chocolatey** *(if you have [choco](https://chocolatey.org/) installed)*

```powershell
choco install nodejs-lts -y
```

After either option, open a **new** terminal and verify it worked:

```bash
node --version   # should print v18 or higher
npm --version    # should print 9 or higher
```

---

## 🚀 Running locally

```bash
# 1. Copy this project folder to your machine

# 2. Open a terminal inside the project folder
#    (in VS Code: Terminal → New Terminal, or cd into the folder)

# 3. Install dependencies  (once only)
npm install

# 4. Start the dev server
npm run dev

# 5. Open your browser at the URL shown — usually:
#    http://localhost:5173
```

> 💡 The dev server keeps running in your terminal while you use the app. Press `Ctrl+C` to stop it when you're done.

---

## 📖 How to use

### Step 1 — Export from Azure Advisor

> ⚠️ **The CSV must come directly from Azure Advisor.** Files from other sources or in other formats will not load correctly.

1. Open [Azure Advisor](https://portal.azure.com/#view/Microsoft_Azure_Expert/AdvisorMenuBlade/~/overview) in the Azure Portal
2. Select the subscriptions you want to review using the **Subscriptions** filter at the top
3. Click **Download as CSV** (top-right of the recommendations list)
4. Save the file — it will be named something like `Advisor_2026-07-16T00_00_00.000Z.csv`

### Step 2 — Load the CSV

1. Open the app at `http://localhost:5173`
2. Drag and drop the CSV onto the upload area, or click to browse
3. The dashboard loads instantly with recommendations grouped by finding

### Step 3 — Triage

Work through the **By Recommendation** tab and set a status for each finding:

| Status | When to use |
|---|---|
| ✅ **Remediate** | Team will action this recommendation |
| ❌ **Dismiss** | Not applicable to this environment |
| 🔶 **Exempt** | Known risk — accepted and documented |

Add a **Note** to capture context, a ticket reference, or the rationale. Decisions save automatically as you type.

### Step 4 — Export

Click **↓ Export Excel** to download `advisor-export-triaged.xlsx`.

The workbook has two sheets:

| Sheet | Contents |
|---|---|
| 📄 **Summary** | One row per recommendation — resource count, affected subscriptions, resource names collapsed, Status & Notes |
| 📋 **All Items** | Every row from the original CSV with Status & Notes on each resource row |

---

## 🔒 Privacy & data

- **Nothing leaves your machine.** The app runs entirely in the browser — no server, no telemetry, no cloud.
- Triage decisions are stored in browser `localStorage`. Clearing browser data will reset them — export before doing so.
- Moving to a new machine or browser? Export first. The **All Items** sheet preserves full triage state and can be re-uploaded to restore decisions.
