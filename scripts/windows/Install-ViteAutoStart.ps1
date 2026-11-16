$ErrorActionPreference = 'Stop'
$taskName = 'EduardoDeLaOsa-ViteDevServer'
$runner = Join-Path $PSScriptRoot 'Start-ViteServer.ps1'
$user = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$powershell = Join-Path $PSHOME 'powershell.exe'
$arguments = "-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$runner`""

$action = New-ScheduledTaskAction -Execute $powershell -Argument $arguments
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $user
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit ([TimeSpan]::Zero)

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Principal $principal `
  -Settings $settings `
  -Description 'Inicia Vite oculto para la red Wi-Fi local y mantiene una sola instancia.' `
  -Force | Out-Null

Start-ScheduledTask -TaskName $taskName
Write-Output "Tarea '$taskName' registrada e iniciada para $user."

$identity = [Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdministrator = $identity.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$firewallRule = 'EduardoDeLaOsa-Vite-LAN-5173'

if ($isAdministrator) {
  $existingRule = Get-NetFirewallRule -DisplayName $firewallRule -ErrorAction SilentlyContinue
  if (-not $existingRule) {
    $node = Get-Command node.exe -ErrorAction Stop
    New-NetFirewallRule `
      -DisplayName $firewallRule `
      -Description 'Permite Vite en el puerto 5173 únicamente desde la subred local.' `
      -Direction Inbound `
      -Action Allow `
      -Protocol TCP `
      -LocalPort 5173 `
      -RemoteAddress LocalSubnet `
      -Profile Private,Public `
      -Program $node.Source | Out-Null
    Write-Output 'Regla de firewall limitada a la subred local creada.'
  }
} else {
  Write-Warning 'La tarea quedó configurada. Para permitir conexiones entrantes en esta red Wi-Fi, ejecuta Install-ViteAutoStart.ps1 como administrador una vez; añadirá una regla limitada a la subred local.'
}
