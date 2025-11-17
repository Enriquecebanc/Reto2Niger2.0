# Start backend with logging for debugging (PowerShell)
# Usage: Open PowerShell in this folder and run: .\start-backend.ps1

Write-Output "Instalando dependencias (si es necesario)..."
npm install

Write-Output "Arrancando backend (index.js) y guardando logs en backend.log..."
# Ejecuta node y guarda salida a backend.log
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "index.js" -RedirectStandardOutput "backend.log" -RedirectStandardError "backend.log" -PassThru

Write-Output "Proceso lanzado. Revisa backend.log o la consola donde ejecutaste este script para ver la salida." 
Write-Output "Si deseas ver las últimas líneas del log: Get-Content backend.log -Wait -Tail 50"