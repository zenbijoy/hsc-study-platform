$ErrorActionPreference = "Stop"
Write-Host "[1/3] Installing Node workspaces..." -ForegroundColor Cyan
npm install
Write-Host "[2/3] Creating Python worker venv..." -ForegroundColor Cyan
Set-Location services/worker
if (!(Test-Path .venv)) { python -m venv .venv }
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\pip.exe install -e ".[dev]"
if (!(Test-Path .env)) { Copy-Item .env.example .env }
Set-Location ../..
if (!(Test-Path apps/admin/.env.local)) { Copy-Item apps/admin/.env.example apps/admin/.env.local }
if (!(Test-Path apps/mobile/.env)) { Copy-Item apps/mobile/.env.example apps/mobile/.env }
Write-Host "[3/3] Done. Start worker, admin and mobile using README.md." -ForegroundColor Green
