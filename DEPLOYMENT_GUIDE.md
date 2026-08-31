# Provendex — Deployment & Operations Guide

**Application Title**: Provendex  
**Developer Credits**: Developed by **HAJANDIKA | ISMAIL | RISHIBH | RITHIN**  
**Repository Name**: `provendex`

---

## 1. Quick Start: Localhost Execution

### Prerequisites
- Node.js $\ge 18.0.0$ (v20+ recommended)
- Python $\ge 3.10$ (Optional, for FastAPI standalone backend microservice)
- npm or pnpm / yarn

### A. Run Next.js Full-Stack Web App (Client Analytics & UI)
```bash
# Navigate to project directory
cd C:\Users\dell\.gemini\antigravity\scratch\provendex

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```
Open your browser at **`http://localhost:3000`**. The application runs with the full local client/edge machine learning engine out of the box with zero external dependencies.

---

### B. Run Standalone Python FastAPI Backend (Optional)
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Start FastAPI server with live reload
uvicorn main:app --reload --port 8000
```
FastAPI Swagger documentation will be available at **`http://localhost:8000/docs`**.

---

## 2. Production Deployment to Vercel

Provendex is designed to deploy to **Vercel** with zero custom configuration.

### Method 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally (if not installed)
npm i -g vercel

# Deploy directly from the project directory
vercel
```

### Method 2: Deploy via Vercel Web Dashboard (GitHub Import)
1. Push the code to a GitHub repository (instructions below).
2. Go to [vercel.com/new](https://vercel.com/new).
3. Select your `provendex` repository and click **Import**.
4. Framework Preset: **Next.js** (Auto-detected).
5. Build Command: `npm run build` (Default).
6. Output Directory: `.next` (Default).
7. Click **Deploy**.

---

## 3. GitHub Repository Setup

To publish Provendex to a new GitHub repository:

```bash
cd C:\Users\dell\.gemini\antigravity\scratch\provendex

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial release of Provendex Procurement Analytics & Risk Platform"

# Link to your remote GitHub repository
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/provendex.git

# Push to GitHub
git push -u origin main
```

---

## 4. Automated Project Archiving & Distribution

To create a clean ZIP archive of the entire project ready for distribution or submission:

### On Windows (PowerShell):
```powershell
npm run package
# OR run the script directly:
powershell -ExecutionPolicy Bypass -File .\package_project.ps1
```
This generates `Provendex_Procurement_OS.zip` in the root folder, excluding `node_modules` and build caches.

### On Linux / macOS (Bash):
```bash
chmod +x ./package_project.sh
./package_project.sh
```

---

## 5. Verification & Health Checklist
- [x] Header branding and credit: `"Developed by HAJANDIKA | ISMAIL | RISHIBH | RITHIN"`
- [x] Dark / Light mode toggle functional across all views
- [x] 4 Core Distribution Pie Charts rendering with hover tooltips
- [x] 50% Disruption Loss Settlement Bar Chart with dynamic loss share slider
- [x] Interactive 3x3 Supplier Risk Matrix (Likelihood vs Impact) with drill-down drawer
- [x] Predictive ML models (Price linear regression cone, Lead time distribution, Quality risks, Capacity utilization)
- [x] Strategy Recommendation generator and persistent Strategy History log (with PDF/JSON export)
- [x] Multi-format Ingestion Engine (CSV, XLSX, MySQL, PDF) with schema auto-mapping
