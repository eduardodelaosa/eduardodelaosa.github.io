$ErrorActionPreference = 'Continue'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path.TrimEnd('\')
$port = 5173
$logDirectory = Join-Path $env:LOCALAPPDATA 'EduardoDeLaOsaVite'
$logPath = Join-Path $logDirectory 'supervisor.log'
$viteOutputPath = Join-Path $logDirectory 'vite-output.log'
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'

if (-not (Test-Path -LiteralPath $logDirectory)) {
  New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
}

function Write-ViteLog([string]$message) {
  Add-Content -LiteralPath $logPath -Encoding UTF8 -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $message"
}

function Get-ProjectViteProcesses {
  $escapedRoot = [regex]::Escape($projectRoot)
  Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match $escapedRoot -and $_.CommandLine -match '[\\/]vite[\\/]bin[\\/]vite\.js' }
}

$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npmCommand) {
  Write-ViteLog 'ERROR: npm.cmd no está disponible en PATH.'
  exit 1
}

$lastWaitState = ''
while ($true) {
  $listeners = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)

  if ($listeners.Count -gt 0) {
    $projectVite = @(Get-ProjectViteProcesses)

    if ($projectVite.Count -gt 0) {
      $lanListener = @($listeners | Where-Object { $_.LocalAddress -notin @('127.0.0.1', '::1') })
      if ($lanListener.Count -gt 0) {
        if ($lastWaitState -ne 'project-lan') {
          Write-ViteLog "Vite del proyecto ya está activo en el puerto $port y accesible por LAN; no se inicia otra instancia."
          $lastWaitState = 'project-lan'
        }
        Start-Sleep -Seconds 10
        continue
      }

      Write-ViteLog 'Vite del proyecto estaba limitado a loopback; se reinicia con host 0.0.0.0.'
      foreach ($process in $projectVite) {
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
      }
      Start-Sleep -Seconds 2
      $lastWaitState = ''
      continue
    }

    if ($lastWaitState -ne 'other-process') {
      Write-ViteLog "El puerto $port está ocupado por otro proceso; no se inicia una instancia duplicada. Se volverá a comprobar."
      $lastWaitState = 'other-process'
    }
    Start-Sleep -Seconds 15
    continue
  }

  $lastWaitState = ''
  Write-ViteLog 'Iniciando: npm run dev -- --host 0.0.0.0'
  try {
    Push-Location $projectRoot
    & $npmCommand.Source run dev -- --host 0.0.0.0 *>> $viteOutputPath
    $viteExitCode = $LASTEXITCODE
    Pop-Location
    Write-ViteLog "Vite terminó con código $viteExitCode; se reintentará en 5 segundos."
  } catch {
    if ((Get-Location).Path -eq $projectRoot) { Pop-Location }
    Write-ViteLog "ERROR al ejecutar Vite: $($_.Exception.Message)"
  }
  Start-Sleep -Seconds 5
}
