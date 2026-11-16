# Servidor Vite automático en Windows

El servidor de desarrollo se ejecuta oculto después de iniciar sesión en Windows mediante la tarea `EduardoDeLaOsa-ViteDevServer`. Utiliza `npm run dev -- --host 0.0.0.0`, conserva HMR y evita iniciar otra instancia si Vite ya está escuchando en el puerto 5173.

## Instalar o volver a registrar

Desde PowerShell, en la raíz del proyecto:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\Install-ViteAutoStart.ps1
```

La tarea se ejecuta al iniciar sesión y queda oculta. Para que otros equipos puedan conectarse, Windows Firewall debe permitir TCP 5173 desde la subred local. Si el instalador indica que faltan permisos, abre PowerShell como administrador y ejecuta el mismo comando; la regla creada queda limitada a `LocalSubnet`.

## Abrir desde otro dispositivo

1. Conecta PC, móvil y tablet a la misma Wi-Fi.
2. Ejecuta `ipconfig` en el PC y localiza la dirección IPv4 de Wi-Fi (por ejemplo, `192.168.1.46`).
3. Abre `http://<IPv4-del-PC>:5173/` en el otro dispositivo.

El equipo debe permanecer encendido y con la sesión de Windows iniciada. HMR sigue activo en Vite.

## Detener, reiniciar o quitar el inicio automático

Detener Vite y deshabilitar el inicio automático:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\Stop-ViteServer.ps1
```

Reiniciarlo en segundo plano:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\Restart-ViteServer.ps1
```

Eliminar la tarea y, si se ejecuta como administrador, su regla de firewall:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\Remove-ViteAutoStart.ps1
```

Los registros se guardan en `%LOCALAPPDATA%\EduardoDeLaOsaVite\supervisor.log` y `vite-output.log`. Para comprobar la tarea y el puerto:

```powershell
Get-ScheduledTask -TaskName 'EduardoDeLaOsa-ViteDevServer'
Get-NetTCPConnection -LocalPort 5173 -State Listen
```
