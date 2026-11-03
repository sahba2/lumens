$c = Get-NetTCPConnection -LocalPort 3210 -State Listen -ErrorAction SilentlyContinue
if ($null -ne $c) {
  foreach ($x in $c) {
    Stop-Process -Id $x.OwningProcess -Force -ErrorAction SilentlyContinue
  }
  'killed'
} else {
  'no listener'
}
