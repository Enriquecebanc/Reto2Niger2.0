import { app, BrowserWindow, Menu, shell } from 'electron'; // 👈 Añadido Menu y shell
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

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
            const rutaInforme = path.join(__dirname, 'documentacion', 'Informe_Final_Reto.pdf');
            shell.openPath(rutaInforme).then(error => {
              if (error) {
                console.error('Error al abrir el informe:', error);
                // Mostrar diálogo alternativo
                shell.showItemInFolder(rutaInforme);
              }
            });
          }
        },
        { type: 'separator' },
        { 
          label: 'Abrir Carpeta Documentación', 
          click: () => {
            const rutaDocumentacion = path.join(__dirname, 'documentacion');
            shell.openPath(rutaDocumentacion);
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
});
