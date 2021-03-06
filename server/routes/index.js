// ===================================================================================================================================
//  Este archivo contendrá todas las rutas (Middleware) de la aplicación
// ===================================================================================================================================

const express = require('express'); // Importa la librería del framework express

const app = express(); // Almacena el método express para poder usar todas sus propiedades, métodos, middleware, etc de este poderoso framework

// ===================================================================================================================================
//  Middleware que contienen las rutas de los archivos que manejan las rutas de la aplicación
// ===================================================================================================================================
app.use(require('./usuario')); // Middleware que carga el archivo "./usuario" con las rutas de usuario de la aplicación
app.use(require('./login')); // Middleware que carga el archivo "./login" con las rutas de login de la aplicación
app.use(require('./categoria')); // Middleware que carga el archivo "./categoria" con las rutas de categoría de la aplicación
app.use(require('./producto')); // Middleware que carga el archivo "./producto" con las rutas de productos de la aplicación
app.use(require('./upload')); // Middleware que carga el archivo "./upload.js" para la carga o subida de archivos de la aplicación
app.use(require('./imagenes')); // Middleware que carga el archivo "./imagenes.js" para mostrar los archivos o imágenes de la aplicación



module.exports = app; // Se exporta "app" totalmente y no un objeto "{key: valor}" para poder utilizar todos los métodos, propiedades y middleware que este contiene