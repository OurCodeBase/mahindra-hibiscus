# 🌺 Mahindra Hibiscus — Bulk Checker Extension

A Chromium extension to check Mahindra Adrenox and Imaxx in bulk. ⚡️  
Quickly validate many entries at once and export results — built with TypeScript for speed and reliability.

## 🔍 What it does
- ✅ Bulk-check Mahindra Adrenox and Imaxx items (VINs)
- 📤 Import lists (paste your vin no. column).
- ▶️ Run checks in parallel with rate-limiting to avoid throttling
- 📥 Export results as excel sheet.
- 🧰 Lightweight popup + background worker for fast processing

## 🚀 Features
- Fast TypeScript implementation for robust checks ⚙️
- Works in Chromium-based browsers (Chrome, Edge, Brave, etc.) 🪄

## 🧩 Secrets
These hidden variables are needed in `.env` file for proper functionality.
1. `VITE_LICENSE_KEY`

## 🛡️ Required Permissions
The extension may request:
- "storage" — save user settings and last results 🗄️
- "activeTab" / "tabs" — open result details if needed 🔗
- (Optional) network access to the Mahindra endpoints used for checks 🌐

Note: The extension does not collect personal data by default. See Privacy below.

## 🔐 Privacy & Safety
This extension runs locally in your browser and only sends the inputs you provide to the configured Mahindra endpoints for validation. It stores settings and recent results in your browser storage. For more info, see the source or open an issue if you need a data-handling audit.

## 📜 License
See the `license.md` file in the repository for license details.

Enjoy bulk-checking with Mahindra Hibiscus! 🌺✨
If you need help, open an issue or contact the maintainers.
