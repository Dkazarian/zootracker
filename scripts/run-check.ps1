param(
  [Parameter(Position = 0, Mandatory = $true)]
  [string] $Executable,

  [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
  [string[]] $Arguments
)

$ErrorActionPreference = 'Continue'

$logDirectory = Join-Path (Get-Location) '.tmp/check-logs'
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$command = @($Executable) + $Arguments
$safeName = ($command -join ' ') -replace '[^a-zA-Z0-9._-]+', '-'
if ($safeName.Length -gt 80) {
  $safeName = $safeName.Substring(0, 80)
}

$logPath = Join-Path $logDirectory "$timestamp-$safeName.log"

Write-Output "Running: $($command -join ' ')"

function ConvertTo-CmdArgument([string] $Value) {
  if ($Value -match '[\s&()<>|^"]') {
    return '"' + ($Value -replace '"', '\"') + '"'
  }
  return $Value
}

$commandLine = ($command | ForEach-Object { ConvertTo-CmdArgument $_ }) -join ' '
& cmd.exe /d /s /c "$commandLine > `"$logPath`" 2>&1"
$exitCode = $LASTEXITCODE
if ($null -eq $exitCode) {
  $exitCode = 0
}

Write-Output "Exit code: $exitCode"
Write-Output "Log: $logPath"

$summaryPattern = 'FAIL|Error|expected|received|Test Suites|Tests:|passed|failed|All matched files|✓|built in|ERROR|WARN'
$summary = Select-String -Path $logPath -Pattern $summaryPattern -CaseSensitive:$false |
  Select-Object -Last 40

if ($exitCode -eq 0) {
  Write-Output 'Result: passed'
  if ($summary) {
    Write-Output 'Summary:'
    $summary | ForEach-Object { Write-Output $_.Line }
  }
  exit 0
}

Write-Output 'Result: failed'
if ($summary) {
  Write-Output 'Failure signals:'
  $summary | ForEach-Object { Write-Output $_.Line }
}

Write-Output 'Last log lines:'
Get-Content -Path $logPath -Tail 80
exit $exitCode
