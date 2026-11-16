$taskName = 'EduardoDeLaOsa-ViteDevServer'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path.TrimEnd('\')

$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($task) {
  Disable-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue | Out-Null
  Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2
$escapedRoot = [regex]::Escape($projectRoot)
$viteProcesses = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -match $escapedRoot -and $_.CommandLine -match '[\\/]vite[\\/]bin[\\/]vite\.js' }
foreach ($process in $viteProcesses) {
  Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
}

Write-Output 'Tarea deshabilitada y servidor Vite de este proyecto detenido.'
