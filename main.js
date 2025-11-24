import { app, BrowserWindow, Menu } from 'electron';
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

  // Ventana inicial
  win.loadURL('http://localhost:5173/');

  // Menú principal
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
            const rutaInforme = path.join(__dirname, 'Reto2Niger2.0', 'src', 'pages', 'Informe_Final_Reto.html');
            fs.readFile(rutaInforme, 'utf8', (err, data) => {
              if (err) return console.error('Error leyendo Informe_Final_Reto.html:', err);
              win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(data));
            });
          }
        },
        {
          label: 'How To',
          click: () => {
            const rutaHow = path.join(__dirname, 'Reto2Niger2.0', 'src', 'pages', 'How_To.html');
            fs.readFile(rutaHow, 'utf8', (err, data) => {
              if (err) return console.error('Error leyendo How_To.html:', err);
              win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(data));
            });
          }
        },
        {
          label: 'Reference Guide',
          click: () => {
            const rutaRef = path.join(__dirname, 'Reto2Niger2.0', 'src', 'pages', 'Reference_Guide.html');
            fs.readFile(rutaRef, 'utf8', (err, data) => {
              if (err) return console.error('Error leyendo Reference_Guide.html:', err);
              win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(data));
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Volver al inicio',
          click: () => win.loadURL('http://localhost:5173/')
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
