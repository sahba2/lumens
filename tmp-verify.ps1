$root = 'c:\Users\TandisCom\Desktop\web'
Set-Location $root

$courses = Get-Content -LiteralPath 'tmp-courses.html' -Raw -Encoding UTF8
$home = Get-Content -LiteralPath 'tmp-home.html' -Raw -Encoding UTF8
$login = Get-Content -LiteralPath 'tmp-login.html' -Raw -Encoding UTF8

$checks = [ordered]@{
  'courses: Blender tab'        = $courses.Contains('Blender')
  'courses: c15 title'          = $courses.Contains('دوره جامع بلندر در معماری')
  'courses: instructor'         = $courses.Contains('تیم تخصصی لومنز')
  'courses: Cycles/Eevee'       = $courses.Contains('Eevee')
  'courses: lesson 5 title'     = $courses.Contains('Neural Rendering')
  'courses: cover course-15'    = $courses.Contains('course-15.svg')
  'home: nav خانه'              = $home.Contains('خانه')
  'home: nav موتور هوش مصنوعی'  = $home.Contains('موتور هوش مصنوعی')
  'home: nav دوره‌های تخصصی'    = $home.Contains('دوره‌های تخصصی')
  'home: nav آبجکت‌های سه‌بعدی' = $home.Contains('آبجکت‌های سه‌بعدی')
  'home: nav مقالات سئو'        = $home.Contains('مقالات سئو')
  'home: login link'            = $home.Contains('href="/auth/login"')
  'home: CTA'                   = $home.Contains('شروع ایده رایگان')
  'login: page rendered'        = $login.Contains('حساب کاربری LUMENS')
}

$lines = @()
foreach ($k in $checks.Keys) { $lines += ('{0} => {1}' -f $k, $checks[$k]) }
$lines | Out-File -Encoding UTF8 (Join-Path $root 'tmp-verify.txt')
$lines
