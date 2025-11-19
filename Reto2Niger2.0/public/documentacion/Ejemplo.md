# Informe Final del Proyecto
## Sistema de Gestión para Niger - Reto 2

---

## 1. Introducción

### Contexto del Proyecto
Este proyecto se desarrolla como parte del **Reto 2: "El Puesto de Mando – Construyendo el Cerebro Digital"**, donde el objetivo es crear desde cero un ERP completo y personalizado. Mientras que en el Reto 1 utilizamos Odoo como base, en este reto hemos desarrollado nuestro propio ERP, creando tanto la empresa Niger como el sistema de gestión completo del ERP.

Hemos creado **Niger**, nuestra empresa dedicada a la fabricación y venta de macetas, diseñando el modelo de negocio y la aplicación que controla todas sus operaciones. Nuestra aplicación funciona como un menu en el que puedes ir navegando por las diferentes pestañas: Fabricacion, Facturacion, Inventario, Proveedores, Ventas y Documentacion.

### Desafío del Reto
Nuestro desafío ha sido desarrollar un ERP propio para gestionar el funcionamiento de nuestra epmresa:
- **Aplicación de escritorio nativa** con Electron para gestión operativa
- **Servidor intermedio Node.js** como puente entre frontend y base de datos
- **Base de datos MongoDB** para almacenamiento flexible
- **Programación asíncrona** para datos en tiempo real

### Problema Detectado
Al crear nuestra empresa desde cero, identificamos las necesidades que necesitaba nuestro ERP:
- Sistema de control de inventario (stock, tipos de productos, búsqueda)
- Plataforma de registro y gestión de ventas vinculada a clientes
- Generación y visualización de facturas profesionales
- Base de datos de proveedores de materiales
- Control del proceso de fabricación de macetas
- Sistema de documentación

### Nuestros Objetivos
1. Crear nuestra empresa y su estructura operativa completa
2. Desarrollar una aplicación de escritorio con Electron + React simulando un ERP profesional
3. Implementar un backend con Node.js y Express como servidor intermedio
4. Utilizar MongoDB Atlas para persistencia flexible de datos
5. Construir módulos clave: Inventario, Ventas, Facturación, Proveedores, Fabricación

---

## 2. Detalles del Proyecto

### 2.1 Tecnologías Utilizadas

**Frontend**: React 18, Vite, Electron, Material-UI, React Router DOM  
**Backend**: Node.js, Express.js, MongoDB Atlas, Mongoose  

### 2.2 Estructura del Código

```
Reto2Niger2.0/
├── backend/
│   ├── models/          # Schemas de MongoDB
│   ├── routes/          # API RESTful
│   └── server.js
└── Reto2Niger2.0/
    ├── src/
    │   ├── pages/       # Módulos principales
    │   ├── componentes/
    │   └── styles/
    └── main.js          # Configuración Electron
```

### 2.3 Funcionalidades Principales

**Inventario**: Es sistema completo para gestionar los productos de la empresa con control de stock en tiempo real y categorización por tipos de macetas (small/medium/big). Incluye funcionalidades de búsqueda y filtrado para facilitar la gestión del almacén.

**Ventas**: Permite registrar ventas vinculándolas directamente con los clientes, calculando automáticamente los totales. Soporta múltiples métodos de pago, agilizando el proceso de registro de cada transacción.

**Facturación**: Genera facturas automáticamente desde las ventas registradas, calculando el IVA (21%) y gestionando estados (Pendiente/Pagada/Cancelada). Incluye un visor profesional que muestra todos los datos del cliente y detalles de la venta.

**Proveedores**: Gestiona los proveedores utilizando componentes de Material-UI para mantener la consistencia visual. Permite registrar, editar y consultar información de todos los proveedores de materiales.

**Fabricación**: Controla el proceso de producción de las macetas, permitiendo hacer seguimiento del estado de fabricación.

**Documentación**: Gestiona los archivos PDF del proyecto de forma centralizada, con visualización en nueva pestaña y opciones de descarga.

### 2.4 Código Destacado

Durante el desarrollo del proyecto, enfrentamos varios desafíos técnicos que requirieron soluciones creativas. A continuación, presentamos algunos fragmentos de código que destacan por su importancia en la resolución de problemas clave.

#### Sistema de Eliminación Robusto

Uno de los problemas más complejos fue que el método estándar de MongoDB `findById()` retornaba `null` de forma inesperada, por lo que no se eliminaban los productos de la base de datos. Para solucionarlo, implementamos un workaround que realiza una búsqueda manual:

```javascript
// Workaround - Búsqueda manual cuando fallan métodos estándar
const todosLosDocs = await collection.find({}).toArray();
const docEncontrado = todosLosDocs.find(doc => doc._id.toString() === id);
const resultado = await collection.deleteOne({ _id: docEncontrado._id });
```

Esta solución recupera todos los documentos, encuentra el correcto comparando IDs como strings, y luego procede con la eliminación. Aunque no es la solución ideal, resultó efectiva y estable.

#### Cálculo Automático en Edición de Ventas

Para mantener la consistencia de datos, implementamos recálculo automático del total antes de enviar actualizaciones:

```javascript
const nuevoTotal = cantidad × precio_unitario;
```

Esto evita inconsistencias cuando se editan cantidades o precios unitarios en las ventas existentes.

#### Enriquecimiento de Datos del Cliente en Facturas

Las facturas inicialmente solo mostraban el nombre del cliente. Para mostrar información completa (dirección, teléfono, email), implementamos un sistema que enriquece los datos:

```javascript
// Enriquecimiento de facturas con info del cliente
const clienteCompleto = todosClientes.find(c => 
  `${c.nombre} ${c.apellidos}`.trim() === nombreBuscado
);
```

Este código busca en la colección completa de clientes y hace match por nombre completo, permitiendo acceder a todos los campos del cliente para mostrarlos en el visor de facturas.

### 2.5 Uso de Inteligencia Artificial

Durante el desarrollo del proyecto, utilizamos herramientas de IA como apoyo en tareas específicas, siempre manteniendo el control y la comprensión del código que escribimos.

**Herramientas utilizadas**:
- **GitHub Copilot**: Integrado en VS Code para sugerencias de código
- **ChatGPT**: Consultas puntuales sobre conceptos y errores

**Aplicaciones concretas**:
- Debugging de problemas complejos (como el issue de MongoDB `findById()`)
- Sugerencias de estilos CSS y estructura de componentes React
- Optimización de código ya escrito por nosotros
- Explicación de errores y posibles soluciones
- Comentarios en el código

**Nuestro enfoque**: La IA funcionó como asistente para acelerar tareas repetitivas y resolver bloqueos puntuales, pero todo el código fue revisado, comprendido y adaptado por el equipo. Las decisiones de arquitectura, diseño y lógica de negocio fueron completamente nuestras.

**Ventajas**: Aceleró el desarrollo en momentos de bloqueo, aportó diferentes perspectivas para resolver problemas, mejoró la calidad de la documentación.

**Limitaciones**: Las sugerencias requirieron supervisión constante, ajustes al contexto específico de nuestro proyecto, y validación para evitar soluciones genéricas que no se adaptaban a nuestras necesidades.

### 2.6 Dificultades Técnicas y Soluciones Implementadas

Durante el desarrollo del proyecto enfrentamos diversos desafíos técnicos que pusieron a prueba nuestras habilidades de debugging y resolución de problemas. A continuación, detallamos los principales obstáculos encontrados y las soluciones implementadas:

#### 2.6.1 Problema Crítico con MongoDB findById()

**Descripción del problema**: El método estándar `findById()` de MongoDB retornaba sistemáticamente `null`, incluso cuando los documentos existían en la base de datos. Este problema bloqueaba completamente las operaciones de eliminación y actualización.

**Impacto**: Las funcionalidades de edición y eliminación en todos los módulos (Inventario, Ventas, Proveedores) quedaron inoperativas, comprometiendo la usabilidad básica del sistema.

**Diagnóstico**: Tras múltiples pruebas, identificamos una posible incompatibilidad en la serialización de ObjectId entre el cliente y el servidor, donde los IDs no se reconocían correctamente en las consultas directas.

**Solución implementada**: Desarrollamos un workaround robusto que realiza una búsqueda manual:
```javascript
const todosLosDocs = await collection.find({}).toArray();
const docEncontrado = todosLosDocs.find(doc => doc._id.toString() === id);
const resultado = await collection.deleteOne({ _id: docEncontrado._id });
```

**Resultado**: Aunque no es la solución ideal desde el punto de vista de rendimiento, garantizó la funcionalidad completa del sistema y demostró nuestra capacidad para encontrar soluciones creativas ante limitaciones técnicas.

#### 2.6.2 Conflictos de Layout y Estilos CSS

**Descripción del problema**: La interfaz no ocupaba la pantalla completa en Electron, mostrando márgenes blancos no deseados y rompiendo el diseño responsive.

**Causa raíz**: Conflicto entre los estilos globales de CSS que utilizaban `display: flex` y la estructura de componentes de React Router.

**Solución**: Reestructuramos la jerarquía CSS eliminando propiedades conflictivas del CSS global y aplicando estilos específicos a nivel de componente, garantizando compatibilidad con Electron.

**Aprendizaje**: La importancia de mantener estilos modulares y evitar reglas globales excesivamente restrictivas en aplicaciones de escritorio.

#### 2.6.3 Enriquecimiento de Datos en el Módulo de Facturación

**Descripción del problema**: Las facturas inicialmente solo almacenaban el nombre del cliente como string simple, sin acceso a información adicional como dirección, teléfono o email, lo que limitaba la profesionalidad de las facturas generadas.

**Impacto**: Las facturas carecían de datos esenciales requeridos en documentos comerciales legales, reduciendo significativamente su utilidad práctica.

**Solución implementada**: Desarrollamos un sistema de enriquecimiento de datos que busca y vincula la información completa del cliente:
```javascript
const clienteCompleto = todosClientes.find(c => 
  `${c.nombre} ${c.apellidos}`.trim() === nombreBuscado
);
```

**Mejora adicional**: Implementamos un sistema de caché para evitar búsquedas repetidas y optimizar el rendimiento del visor de facturas.

#### 2.6.4 Inconsistencias en Cálculos de Ventas

**Descripción del problema**: Al editar ventas existentes (modificando cantidad o precio unitario), el total no se recalculaba automáticamente, generando inconsistencias entre los datos mostrados y los almacenados.

**Impacto**: Datos financieros incorrectos que podrían derivar en errores de facturación y reportes inexactos.

**Solución**: Implementamos recálculo automático en el frontend antes de enviar actualizaciones:
```javascript
const nuevoTotal = cantidad × precio_unitario;
```

**Validación adicional**: Añadimos validaciones para evitar valores negativos o nulos que pudieran corromper los registros.

#### 2.6.5 Conflicto de React Router con Archivos PDF

**Descripción del problema**: React Router interceptaba las rutas de los archivos PDF en el módulo de Documentación, impidiendo su visualización correcta. Los PDFs se trataban como rutas de navegación en lugar de recursos estáticos.

**Intentos fallidos**: 
- Configurar iframe con rutas relativas
- Usar componentes específicos de visualización de PDFs
- Ajustar la configuración de Vite para servir archivos estáticos

**Solución definitiva**: Implementamos `window.open()` para abrir PDFs en nueva pestaña del navegador, evitando completamente el sistema de routing:
```javascript
window.open('/documentacion/archivo.pdf', '_blank');
```

**Beneficio adicional**: Esta solución mejoró la experiencia de usuario permitiendo vista independiente de documentos sin abandonar la aplicación.

#### 2.6.6 Lecciones Aprendidas

Este conjunto de desafíos nos enseñó:
- **Persistencia en el debugging**: No siempre existen soluciones "perfectas"; a veces se requieren workarounds pragmáticos
- **Pensamiento lateral**: Cuando los métodos convencionales fallan, buscar alternativas creativas
- **Importancia de las pruebas**: Identificar problemas tempranamente ahorra tiempo en fases avanzadas
- **Documentación del proceso**: Registrar problemas y soluciones facilita el mantenimiento futuro
- **Trabajo colaborativo**: Compartir conocimientos del equipo acelera la resolución de problemas complejos

---

## 3. Reflexión del Equipo

### Resultados Obtenidos
- Hemos construido un sistema funcional completo con todos los módulos operativos
- Diseñamos una interfaz intuitiva con dark mode unificado
- Garantizamos la persistencia de datos con MongoDB Atlas
- Nuestra aplicación de escritorio está lista para distribución

### Trabajo en Equipo
[*Añadir nuestra experiencia de colaboración, cómo distribuimos las tareas, uso de GitHub, comunicación del equipo*]

### Lo que Aprendimos
- **Stack MERN completo**: MongoDB, Express, React, Node.js
- **Electron**: Cómo crear aplicaciones de escritorio con tecnologías web
- **Debugging avanzado**: Buscar soluciones creativas cuando los métodos estándar fallan
- **Diseño de interfaces**: UX/UI, consistencia visual
- **Gestión de estado**: React Hooks, sincronización de datos

### Mejoras Futuras
- Sistema de autenticación con roles
- Dashboard con estadísticas y gráficos
- Reportes exportables (Excel/PDF)
- Testing automatizado (Jest, Cypress)
- Notificaciones y alertas de stock
- Backup automático de base de datos

---

## 4. Conclusión

Nuestro Sistema de Gestión para Niger cumple exitosamente los objetivos planteados, proporcionando una solución completa que centraliza todas las operaciones de nuestra empresa ficticia. Este proyecto nos ha permitido aplicar conocimientos en un caso práctico real, desarrollando habilidades técnicas y de resolución de problemas.

**Nuestros logros clave**: Aplicación funcional, backend robusto, interfaz moderna, uso eficiente de IA para desarrollo.

**Valor aportado**: Mejora de eficiencia operativa, reducción de errores, facilita toma de decisiones.

Con las mejoras propuestas, nuestro sistema puede evolucionar hacia una solución empresarial escalable y lista para producción.

---

*Documento generado el 18 de noviembre de 2025*