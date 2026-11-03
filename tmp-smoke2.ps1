$root = 'c:\Users\TandisCom\Desktop\web'
Set-Location $root

$targets = [ordered]@{
  blender  = 'http://localhost:3210/courses?tag=Blender'
  sketchup = 'http://localhost:3210/courses?tag=SketchUp'
}

foreach ($key in $targets.Keys) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri $targets[$key] -TimeoutSec 60
    $r.Content | Out-File -Encoding UTF8 (Join-Path $root ('tmp-' + $key + '.html'))
    '{0} status={1} length={2}' -f $key, $r.StatusCode, $r.Content.Length
  } catch {
    '{0} ERROR {1}' -f $key, $Error[0].Exception.Message
  }
}
