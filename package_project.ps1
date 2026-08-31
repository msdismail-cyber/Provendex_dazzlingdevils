# Provendex Packaging Script - Generates a clean project zip for GitHub / Distribution & Browser Download
$ErrorActionPreference = "Stop"

$ProjectRoot = $PSScriptRoot
$ZipName = "Provendex_Procurement_OS.zip"
$DestinationZip = Join-Path $ProjectRoot $ZipName
$PublicDir = Join-Path $ProjectRoot "public"
$PublicZip = Join-Path $PublicDir $ZipName

if (-not (Test-Path $PublicDir)) {
    New-Item -ItemType Directory -Path $PublicDir -Force | Out-Null
}

Write-Host "Creating Provendex Distribution Archive: $DestinationZip..." -ForegroundColor Cyan

# Remove existing zip if present
if (Test-Path $DestinationZip) {
    Remove-Item $DestinationZip -Force
}
if (Test-Path $PublicZip) {
    Remove-Item $PublicZip -Force
}

# Collect files excluding node_modules, .next, .git, etc.
$ExcludedFolders = @("node_modules", ".next", ".git", ".system_generated", "provendex_history.db")

$TempDir = Join-Path $env:TEMP "provendex_pkg_$(Get-Random)"
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

Get-ChildItem -Path $ProjectRoot -Exclude $ExcludedFolders | ForEach-Object {
    if ($_.Name -notin $ExcludedFolders -and $_.Name -ne $ZipName) {
        Copy-Item -Path $_.FullName -Destination $TempDir -Recurse -Force
    }
}

Compress-Archive -Path "$TempDir\*" -DestinationPath $DestinationZip -CompressionLevel Optimal
Copy-Item -Path $DestinationZip -Destination $PublicZip -Force
Remove-Item -Path $TempDir -Recurse -Force

Write-Host "Successfully packaged Provendex into:" -ForegroundColor Green
Write-Host "1. Root Archive: $DestinationZip" -ForegroundColor Green
Write-Host "2. Downloadable Web Asset: $PublicZip" -ForegroundColor Green
