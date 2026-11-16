$stopScript = Join-Path $PSScriptRoot 'Stop-ViteServer.ps1'
$taskName = 'EduardoDeLaOsa-ViteDevServer'

& $stopScript
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

$identity = [Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
if ($identity.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Remove-NetFirewallRule -DisplayName 'EduardoDeLaOsa-Vite-LAN-5173' -ErrorAction SilentlyContinue
}

Write-Output 'Inicio automático eliminado.'
