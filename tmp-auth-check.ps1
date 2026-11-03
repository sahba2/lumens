$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$base = 'http://localhost:3000'
$email = 'check.' + ([guid]::NewGuid().ToString('N').Substring(0, 8)) + '@lumens.test'
$password = 'Lumens#2026'

$loginPage = Invoke-WebRequest -Uri "$base/auth/login" -UseBasicParsing
$loginHtml = [Text.Encoding]::UTF8.GetString($loginPage.RawContentStream.ToArray())
"loginpage=$($loginPage.StatusCode) hasEmailInput=$($loginHtml.Contains('you@example.com')) hasRoleButton=$($loginHtml.Contains('instructor'))"

$signupBody = @{ fullName = 'Check User'; email = $email; password = $password; role = 'student' } | ConvertTo-Json
$signup = Invoke-RestMethod -Method Post -Uri "$base/api/auth/signup" -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($signupBody))
"signup=$($signup.ok) role=$($signup.user.role)"

$csrf = Invoke-RestMethod -Uri "$base/api/auth/csrf" -SessionVariable webSession
$login = Invoke-RestMethod -Method Post -Uri "$base/api/auth/callback/credentials" -ContentType 'application/x-www-form-urlencoded' -Body @{ csrfToken = $csrf.csrfToken; email = $email; password = $password; callbackUrl = "$base/dashboard"; json = 'true' } -WebSession $webSession
"login=$($login.url)"

$dash = Invoke-WebRequest -Uri "$base/dashboard" -WebSession $webSession -UseBasicParsing
$dashHtml = [Text.Encoding]::UTF8.GetString($dash.RawContentStream.ToArray())
"dashboard=$($dash.StatusCode) hasName=$($dashHtml.Contains('Check User')) hasEmail=$($dashHtml.Contains($email))"

$session = Invoke-RestMethod -Uri "$base/api/auth/session" -WebSession $webSession
"session_role=$($session.user.role)"

$signoutCsrf = Invoke-RestMethod -Uri "$base/api/auth/csrf" -WebSession $webSession
Invoke-RestMethod -Method Post -Uri "$base/api/auth/signout" -ContentType 'application/x-www-form-urlencoded' -Body @{ csrfToken = $signoutCsrf.csrfToken; callbackUrl = "$base/"; json = 'true' } -WebSession $webSession | Out-Null
$after = Invoke-RestMethod -Uri "$base/api/auth/session" -WebSession $webSession
"after_signout_empty=$($null -eq $after.user)"

$guest = Invoke-WebRequest -Uri "$base/dashboard" -MaximumRedirection 0 -UseBasicParsing -ErrorAction SilentlyContinue
"guest_dashboard_not_redirected=$($guest -ne $null)"
