# Backend (API)

Pasos rápidos para arrancar y depurar el backend en Windows (PowerShell).

1) Abrir PowerShell en la carpeta `backend`:

```powershell
cd 'C:\Users\Propietario\Documents\GitHub\Reto2Niger2.0\backend'
```

2) Instalar dependencias (solo la primera vez o si cambias package.json):

```powershell
npm install
```

3) Arrancar el servidor (modo estándar):

```powershell
npm start
# o directamente
node index.js
```

Deberías ver en la terminal mensajes como:

- `✅ Conectado a MongoDB` o un error detallado si la conexión falla.
- `Servidor backend corriendo en puerto 5000` (si todo está bien).

4) Comprobar que el endpoint principal responde:

```powershell
Invoke-RestMethod http://localhost:5000/
```

Debes recibir: `API ERP funcionando correctamente 🚀`

5) Si al arrancar tienes un error (stack trace), guarda la salida en un fichero y pégalo en el chat:

```powershell
# Ejecuta y guarda la salida
node index.js 2>&1 | Tee-Object -FilePath backend.log
# Reproduce el error y luego pega aquí el contenido de backend.log
Get-Content backend.log -Tail 200
```

6) Ejecutar migración (si quieres rellenar `tamano`/`tipoProducto` en los proveedores existentes):

```powershell
node scripts/addTamanoTipoToProveedores.js
```

7) Si la API no responde en `:5000`, revisa si otro proceso ocupa el puerto:

```powershell
netstat -ano | Select-String ":5000"
```

8) Si necesitas ayuda, pega aquí exactamente:
- La salida completa de la terminal donde ejecutaste `node index.js`.
- El resultado de `Invoke-RestMethod http://localhost:5000/proveedores`.
- Salida de `netstat -ano | Select-String ":5000"`.

Con esos datos te doy la solución inmediata.
