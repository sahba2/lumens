$root = 'c:\Users\TandisCom\Desktop\web'
Set-Location $root

if (Test-Path 'tmp-build2-status.txt') { Remove-Item 'tmp-build2-status.txt' -Force }

& cmd.exe /c 'npm run build > tmp-build2.txt 2>&1'
$code = $LASTEXITCODE

if ($code -eq 0) {
  'BUILD_OK' | Out-File -Encoding ascii 'tmp-build2-status.txt'
} else {
  ('BUILD_FAIL ' + $code) | Out-File -Encoding ascii 'tmp-build2-status.txt'
}
