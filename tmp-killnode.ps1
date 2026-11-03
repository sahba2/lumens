$procs = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'"
foreach ($p in $procs) {
  $cmd = $p.CommandLine
  if ($cmd -and ($cmd -match 'next' -or $cmd -match 'npm')) {
    Write-Output ('kill ' + $p.ProcessId + ' :: ' + $cmd)
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
  }
}
Write-Output 'done'
