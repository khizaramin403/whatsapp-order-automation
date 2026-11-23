$proc = Start-Process pnpm.cmd -ArgumentList '--filter', '@app/web', 'dev' -PassThru
Start-Sleep -Seconds 7
try {
  node apps/web/scripts/screenshot-step27.mjs
} finally {
  if ($proc) {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  }
  Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*next*' } | Stop-Process -Force -ErrorAction SilentlyContinue
}
