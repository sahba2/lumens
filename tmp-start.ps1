$root = 'c:\Users\TandisCom\Desktop\web'
Set-Location $root

$proc = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run start -- -p 3210 > tmp-dev.txt 2>&1' -PassThru -WindowStyle Hidden
$proc.Id | Out-File -Encoding ascii (Join-Path $root 'tmp-dev.pid')
Start-Sleep -Seconds 18
'started'
