import { app, BrowserWindow, Menu, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Carga la URL de tu frontend por defecto
  win.loadURL('http://localhost:5173/');

  // 🔹 Menú personalizado
  const template = [
    {
      label: 'Aplicación',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'quit', label: 'Salir' }
      ]
    },
    {
      label: 'Documentación',
      submenu: [
        { 
          label: 'Informe Final Reto', 
          click: () => {
            // 🔹 Ajustado a tu estructura real de carpetas
            const rutaInforme = path.join(__dirname, 'Reto2Niger2.0', 'src', 'pages', 'Informe_Final_Reto.html');
            
            fs.readFile(rutaInforme, 'utf8', (err, data) => {
              if (err) {
                console.error('Error leyendo el HTML del informe:', err);
                return;
              }
              win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(data));
            });
          }
        },
        { 
          label: 'Volver al inicio',
          click: () => {
            win.loadURL('http://localhost:5173/');
          }
        },
        { type: 'separator' },
        { 
          label: 'Abrir Carpeta Documentación',
          click: () => {
            const rutaCarpeta = path.join(__dirname, 'Reto2Niger2.0', 'src', 'pages');
            shell.openPath(rutaCarpeta)
              .then(resultado => {
                if (resultado) console.error('Error al abrir la carpeta:', resultado);
              });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
