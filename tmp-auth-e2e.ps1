$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$base = 'http://localhost:3000'
$password = 'Lumens#2026'
$results = @()

function Check($label, $ok) { $script:results += [pscustomobject]@{ Label = $label; Pass = [bool]$ok } }

function Signup($name, $email, $role, $pass = $password) {
  $body = @{ fullName = $name; email = $email; password = $pass; role = $role } | ConvertTo-Json
  $bytes = [Text.Encoding]::UTF8.GetBytes($body)
  $response = Invoke-WebRequest -Method Post -Uri "$base/api/auth/signup" `
    -ContentType 'application/json; charset=utf-8' -Body $bytes -SkipHttpErrorCheck
  return [pscustomobject]@{
    Status = [int]$response.StatusCode
    Json   = ($response.Content | ConvertFrom-Json)
  }
}

# --- 1. login page renders the form -----------------------------------------
$loginPage = Invoke-WebRequest -Uri "$base/auth/login" -UseBasicParsing
$loginHtml = [Text.Encoding]::UTF8.GetString($loginPage.RawContentStream.ToArray())
Check 'GET /auth/login 200' ($loginPage.StatusCode -eq 200)
Check 'login page has email input' ($loginHtml.Contains('you@example.com'))
Check 'login page has role selector' ($loginHtml.Contains('دانشجو / معمار') -and $loginHtml.Contains('مدرس'))

# --- 2. sign-up: student -----------------------------------------------------
$studentEmail = 'student.' + ([guid]::NewGuid().ToString('N').Substring(0, 8)) + '@lumens.test'
$student = Signup 'Sara Ahmadi' $studentEmail 'student'
Check 'signup(student) -> 201' ($student.Status -eq 201)
Check 'signup(student) ok=true' ($student.Json.ok -eq $true)
Check 'signup(student) role echoed' ($student.Json.user.role -eq 'student')
Check 'signup never returns passwordHash' (-not ($student.Json.user.PSObject.Properties.Name -contains 'passwordHash'))

# --- 3. duplicate e-mail -> 409 ---------------------------------------------
$duplicate = Signup 'Sara Ahmadi' ($studentEmail.ToUpper()) 'student'
Check 'duplicate signup -> 409' ($duplicate.Status -eq 409)
Check 'duplicate signup ok=false' ($duplicate.Json.ok -eq $false)

# --- 4. invalid role -> 400 --------------------------------------------------
$badRoleEmail = 'bad.' + ([guid]::NewGuid().ToString('N').Substring(0, 8)) + '@lumens.test'
$badRole = Signup 'Bad Role' $badRoleEmail 'admin'
Check 'invalid role -> 400' ($badRole.Status -eq 400)
Check 'invalid role ok=false' ($badRole.Json.ok -eq $false)

# --- 5. short password -> 400 ------------------------------------------------
$shortEmail = 'short.' + ([guid]::NewGuid().ToString('N').Substring(0, 8)) + '@lumens.test'
$short = Signup 'Short Pass' $shortEmail 'student' 'abc123'
Check 'short password -> 400' ($short.Status -eq 400)

# --- 6. sign-up: instructor --------------------------------------------------
$instructorEmail = 'teacher.' + ([guid]::NewGuid().ToString('N').Substring(0, 8)) + '@lumens.test'
$instructor = Signup 'Navid Rad' $instructorEmail 'instructor'
Check 'signup(instructor) -> 201' ($instructor.Status -eq 201)
Check 'signup(instructor) role echoed' ($instructor.Json.user.role -eq 'instructor')

# --- 7. credentials sign-in (instructor) + session role ---------------------
$csrf = Invoke-RestMethod -Uri "$base/api/auth/csrf" -SessionVariable webSession
$callback = Invoke-RestMethod -Method Post -Uri "$base/api/auth/callback/credentials" `
  -ContentType 'application/x-www-form-urlencoded' `
  -Body @{ csrfToken = $csrf.csrfToken; email = $instructorEmail; password = $password; callbackUrl = "$base/dashboard"; json = 'true' } `
  -WebSession $webSession
Check 'credentials login did not fail' ($callback.url -notmatch 'error')

$session = Invoke-RestMethod -Uri "$base/api/auth/session" -WebSession $webSession
Check 'session user exists' ($null -ne $session.user)
Check 'session role = instructor' ($session.user.role -eq 'instructor')
Check 'session email matches' ($session.user.email -eq $instructorEmail)

# --- 8. dashboard renders the signed-in instructor ---------------------------
$dash = Invoke-WebRequest -Uri "$base/dashboard" -WebSession $webSession -UseBasicParsing
$dashHtml = [Text.Encoding]::UTF8.GetString($dash.RawContentStream.ToArray())
Check 'GET /dashboard 200 (signed in)' ($dash.StatusCode -eq 200)
Check 'dashboard shows full name' ($dashHtml.Contains('Navid Rad'))
Check 'dashboard shows email' ($dashHtml.Contains($instructorEmail))
Check 'dashboard shows instructor badge' ($dashHtml.Contains('پنل مدرس'))

# --- 9. wrong password is rejected ------------------------------------------
$badCsrf = Invoke-RestMethod -Uri "$base/api/auth/csrf" -SessionVariable badSession
Invoke-RestMethod -Method Post -Uri "$base/api/auth/callback/credentials" `
  -ContentType 'application/x-www-form-urlencoded' `
  -Body @{ csrfToken = $badCsrf.csrfToken; email = $instructorEmail; password = 'WrongPass123'; callbackUrl = "$base/dashboard"; json = 'true' } `
  -WebSession $badSession | Out-Null
$badSessionData = Invoke-RestMethod -Uri "$base/api/auth/session" -WebSession $badSession
Check 'wrong password rejected' ($null -eq $badSessionData.user)

# --- 10. sign-out clears the session ----------------------------------------
$signoutCsrf = Invoke-RestMethod -Uri "$base/api/auth/csrf" -WebSession $webSession
Invoke-RestMethod -Method Post -Uri "$base/api/auth/signout" -ContentType 'application/x-www-form-urlencoded' `
  -Body @{ csrfToken = $signoutCsrf.csrfToken; callbackUrl = "$base/"; json = 'true' } -WebSession $webSession | Out-Null
$after = Invoke-RestMethod -Uri "$base/api/auth/session" -WebSession $webSession
Check 'sign-out clears session' ($null -eq $after.user)

# --- 11. guest is redirected away from the dashboard -----------------------
$guestResponse = Invoke-WebRequest -Uri "$base/dashboard" -MaximumRedirection 0 -UseBasicParsing -SkipHttpErrorCheck
Check 'guest /dashboard redirects' ($guestResponse.StatusCode -eq 307)

# --- 12. stored data: bcrypt hash on disk, plain password never -------------
$usersRaw = Get-Content -LiteralPath (Join-Path $PSScriptRoot '.data/users.json') -Raw
$users = $usersRaw | ConvertFrom-Json
$storedInstructor = $users | Where-Object { $_.email -eq $instructorEmail } | Select-Object -First 1
Check 'instructor persisted on disk' ($null -ne $storedInstructor)
Check 'password stored as bcrypt hash' ($storedInstructor.passwordHash -match '^\$2[aby]\$\d{2}\$')
Check 'plain password not stored' (-not ($usersRaw.Contains($password)))

$failed = 0
foreach ($result in $results) {
  if (-not $result.Pass) { $failed++ }
  "{0}  {1}" -f $(if ($result.Pass) { 'PASS' } else { 'FAIL' }), $result.Label
}

'---'
"student=$studentEmail"
"instructor=$instructorEmail"
if ($failed -eq 0) { 'ALL_AUTH_E2E_CHECKS_PASSED' } else { "$failed AUTH E2E CHECK(S) FAILED" }
