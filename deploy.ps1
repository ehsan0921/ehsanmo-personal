# Cloudflare Pages — build (Vite) then deploy `dist/`
# Project: ehsanmo-personal (perforated-panel-designer.pages.dev, ehsanmo.me)

Write-Host "Building and deploying to Cloudflare Pages..." -ForegroundColor Green

try {
  $null = npx wrangler --version 2>&1
} catch {
  Write-Host "Install deps: npm install" -ForegroundColor Red
  exit 1
}

$authCheck = npx wrangler whoami 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Run: npx wrangler login" -ForegroundColor Yellow
  exit 1
}

Set-Location $PSScriptRoot
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

npx wrangler pages deploy dist --project-name=ehsanmo-personal --commit-dirty=true
if ($LASTEXITCODE -eq 0) {
  Write-Host "Done. Check Cloudflare dashboard for the preview URL." -ForegroundColor Cyan
}
