$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputDir = Join-Path $root 'submission'
$zipPath = Join-Path $outputDir 'RiskPath_Source_Code.zip'
$tempDir = Join-Path $outputDir 'RiskPath_Source_Code'

if (!(Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

if (Test-Path $tempDir) {
  Remove-Item -Recurse -Force $tempDir
}

New-Item -ItemType Directory -Path $tempDir | Out-Null

$excludeDirs = @('node_modules', 'dist', '.git', '.vscode', 'submission')
$excludeFiles = @('*.log', '.env')

Get-ChildItem -Path $root -Force | Where-Object {
  $name = $_.Name
  if ($excludeDirs -contains $name) { return $false }
  if ($_.PSIsContainer) { return $true }
  foreach ($pattern in $excludeFiles) {
    if ($name -like $pattern) { return $false }
  }
  return $true
} | ForEach-Object {
  Copy-Item -Recurse -Force -Path $_.FullName -Destination $tempDir
}

if (Test-Path $zipPath) {
  Remove-Item -Force $zipPath
}

Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $zipPath

Write-Host "Created: $zipPath"
