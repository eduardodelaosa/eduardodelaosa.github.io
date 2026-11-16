$taskName = 'EduardoDeLaOsa-ViteDevServer'
$stopScript = Join-Path $PSScriptRoot 'Stop-ViteServer.ps1'
$installScript = Join-Path $PSScriptRoot 'Install-ViteAutoStart.ps1'

& $stopScript
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if (-not $task) {
  & $installScript
  exit $LASTEXITCODE
}

Enable-ScheduledTask -TaskName $taskName | Out-Null
Start-ScheduledTask -TaskName $taskName
Write-Output 'Servidor Vite reiniciado en segundo plano.'
