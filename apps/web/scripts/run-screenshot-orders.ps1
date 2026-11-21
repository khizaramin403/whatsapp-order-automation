$proc = Start-Process pnpm -ArgumentList '--filter', '@app/web', 'start' -PassThru
Start-Sleep -Seconds 3
try {
  node apps/web/scripts/screenshot-orders.mjs
} finally {
  Stop-Process -Id $proc.Id -Force
  Get-Process node, pnpm -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*next start*' } | Stop-Process -Force -ErrorAction SilentlyContinue
}
