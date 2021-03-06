require('./config/config'); // Importa el contenido este arcivo './config/config' al inicio de la aplicación que contiene las variables globales y de entorno que serán empleadas por la aplicación

const express = require('express'); // Importa la librería del framework express

const mongoose = require('mongoose'); // Importar la librería de mongoose para poder conectarnos a uan DB de mongoDB

const path = require('path'); // Importar paquete de node encargado de armar las rutas o path de la aplicación utilizando el método "resolve()". Viene con el node, no hace falta instalarlo con "npm"

const app = express(); // Almacena el método express para poder usar todas sus propiedades, métodos, middleware, etc de este poderoso framework

// const bodyParser = require('body-parser'); // Importa el paquete 'body-parser' para poder usarlo como middleware y poder obtener en el objeto 'req.body' del cuerpo de las peticiones (propiedades y sus valores). Esta forma está deprecada ahora viene dentro del express y se emplea el middleware como se muestra más abajo

// =========================================================================================
// Body Parser Middlewares para obtener el 'req.body'. Sin estos middlewares no se podría obtener el cuerpo de las peticiones http (req.body)
// =========================================================================================
app.use(express.urlencoded({ extended: false })); // Para parsear el tipo de body 'application/x-www-form-urlencoded'. Ahora se usa así y no como antes 'app.use(bodyParser.urlencoded({ extended: false }))' ya que quedó deprecado
app.use(express.json()); // Para parsear el tipo de body 'application/json'. Ahora se usa así y no como antes 'app.use(bodyParser.json())' ya que quedó deprecado

// ======================================================================================================================
// Rutas Middleware
// ======================================================================================================================
app.use(require('./routes/index')); // Middleware de rutas que carga el archivo "./routes/index" que contiene las rutas de los archivos que manejan todas las rutas de la aplicación

// ======================================================================================================================
// Habilitar la carpeta "public" para poder acceder a ella desde cualquier lugar (Middleware)
// ======================================================================================================================
app.use(express.static(path.resolve(__dirname, '../public'))); // Middleware que habilita la carpeta "public". Con el método "path.resolve(__dirname, '../public')" configuro la ruta o path absoluto para que funcione correctamente

// ======================================================================================================================
// Conexión a la DB
// ======================================================================================================================
mongoose.connect(process.env.URL_DB_MONGO, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }, (err, res) => { // Se establece conexión a la DB 'cafe' en el host local (mongodb://localhost:27017/cafe). Después viene un objeto con opciones de configuración de mongoose '{ useNewUrlParser: true, useUnifiedTopology: true, ... }' y finalmente una callback que recibe un error y una respuesta
    if (err) throw err; // Si existe un error en la conexión muestra el error (err)
    console.log('Conectado a la DB'); // Si se establece la conexión correctamente muestra el sgte mensaje
});

// ======================================================================================================================
// Escuchando las peticiones http
// ======================================================================================================================
app.listen(process.env.PORT, () => {
    console.log('Escuchando peticiones por el puerto: ', process.env.PORT);
});