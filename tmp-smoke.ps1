$ErrorActionPreference = 'Continue'
$root = 'c:\Users\TandisCom\Desktop\web'
Set-Location $root

$proc = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run start -- -p 3210 > tmp-dev.txt 2>&1' -PassThru -WindowStyle Hidden
$proc.Id | Out-File -Encoding ascii (Join-Path $root 'tmp-dev.pid')
Start-Sleep -Seconds 16

$pages = [ordered]@{ home = '/'; courses = '/courses'; login = '/auth/login' }
$report = @()

foreach ($key in $pages.Keys) {
  $url = 'http://localhost:3210' + $pages[$key]
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 90
    $content = $r.Content
    $report += ('{0} status={1} length={2}' -f $key, $r.StatusCode, $content.Length)
    $content | Out-File -Encoding UTF8 (Join-Path $root ('tmp-' + $key + '.html'))
  } catch {
    $err = $Error[0].Exception.Message
    $report += ('{0} ERROR {1}' -f $key, $err)
  }
}

$report | Out-File -Encoding UTF8 (Join-Path $root 'tmp-smoke.txt')
$report
