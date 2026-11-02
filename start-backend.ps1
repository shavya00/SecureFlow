# SecureFlow Distributed Banking & Fraud Engine Backend Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  SecureFlow - Distributed Banking & Fraud Engine" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$env:JAVA_HOME = "C:\Users\shavy\tools\jdk-21.0.6+7"
$env:Path = "$env:JAVA_HOME\bin;C:\Users\shavy\tools\apache-maven-3.9.9\bin;$env:Path"

# Load .env file if present
$envFile = if (Test-Path "$PSScriptRoot\.env") { "$PSScriptRoot\.env" } elseif (Test-Path "$PSScriptRoot\backend\.env") { "$PSScriptRoot\backend\.env" } else { $null }
if ($envFile) {
    Write-Host "[*] Loading environment variables from $envFile" -ForegroundColor Yellow
    Get-Content $envFile | Where-Object { $_ -match '^\s*([^#][^=]+)=(.*)$' } | ForEach-Object {
        $key = $matches[1].Trim()
        $val = $matches[2].Trim()
        [System.Environment]::SetEnvironmentVariable($key, $val, 'Process')
    }
}

Write-Host "`n[*] Java Home : $env:JAVA_HOME" -ForegroundColor Gray
Write-Host "[*] Port      : http://localhost:8080" -ForegroundColor Gray
Write-Host "[*] Booting Spring Boot Application...`n" -ForegroundColor Green

Set-Location -Path "$PSScriptRoot\backend"
mvn spring-boot:run
