param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$PrismaArgs
)

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$envPath = Resolve-Path (Join-Path $projectRoot "..\.env")
$prismaCmd = Join-Path $projectRoot "backend\node_modules\.bin\prisma.cmd"

Get-Content -LiteralPath $envPath | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
    return
  }

  $key, $value = $line.Split("=", 2)
  $value = $value.Trim().Trim('"').Trim("'")
  [Environment]::SetEnvironmentVariable($key.Trim(), $value, "Process")
}

& $prismaCmd @PrismaArgs
exit $LASTEXITCODE