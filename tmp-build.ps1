$root = 'c:\Users\TandisCom\Desktop\web'
Set-Location $root

if (Test-Path 'tmp-build-status.txt') { Remove-Item 'tmp-build-status.txt' -Force }

& cmd.exe /c 'npm run build > tmp-build.txt 2>&1'
$code = $LASTEXITCODE

if ($code -eq 0) {
  'BUILD_OK' | Out-File -Encoding ascii 'tmp-build-status.txt'
} else {
  ('BUILD_FAIL ' + $code) | Out-File -Encoding ascii 'tmp-build-status.txt'
}
