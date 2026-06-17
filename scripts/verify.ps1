$ErrorActionPreference = "Stop"

function Run-Step {
    param(
        [string]$Name,
        [scriptblock]$Command
    )

    Write-Host ""
    Write-Host "==> $Name"
    & $Command
}

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Run-Step "Contract tests" {
    cargo test
}

Run-Step "Contract WASM build" {
    stellar contract build --package impact-voucher
}

Run-Step "Backend build" {
    Push-Location "$root\backend"
    npm run build
    Pop-Location
}

Run-Step "Backend tests" {
    Push-Location "$root\backend"
    npm test
    Pop-Location
}

Run-Step "Backend lint" {
    Push-Location "$root\backend"
    npm run lint
    Pop-Location
}

Run-Step "Backend dependency audit" {
    Push-Location "$root\backend"
    npm audit --omit=dev
    Pop-Location
}

Run-Step "Frontend build" {
    Push-Location "$root\frontend"
    npm run build
    Pop-Location
}

Run-Step "Frontend lint" {
    Push-Location "$root\frontend"
    npm run lint
    Pop-Location
}

Run-Step "Frontend dependency audit" {
    Push-Location "$root\frontend"
    npm audit --omit=dev
    Pop-Location
}

Write-Host ""
Write-Host "All verification steps completed."
