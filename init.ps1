# br1cg - Initialization and verification script
Write-Host "=== br1cg Init ===" -ForegroundColor Cyan

# Check Bun
$bunVersion = bun --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Bun $bunVersion" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Bun not found. Install from https://bun.sh" -ForegroundColor Red
    exit 1
}

# Check dependencies
if (Test-Path "node_modules") {
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[..] Installing dependencies..." -ForegroundColor Yellow
    bun install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[FAIL] Install failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
}

# Check data directory
if (-not (Test-Path "data")) {
    New-Item -ItemType Directory -Force -Path "data" | Out-Null
    Write-Host "[OK] Data directory created" -ForegroundColor Green
} else {
    Write-Host "[OK] Data directory exists" -ForegroundColor Green
}

# Check Astro build
if (Test-Path "dist") {
    Write-Host "[OK] Build directory exists" -ForegroundColor Green
} else {
    Write-Host "[..] No build found (run 'bun run build' for production)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Ready ===" -ForegroundColor Cyan
Write-Host "  dev:   bun run dev" -ForegroundColor White
Write-Host "  build: bun run build" -ForegroundColor White
Write-Host "  start: bun run start" -ForegroundColor White
