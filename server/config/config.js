// ==================================================================
//  PUERTO por dónde escuchará la aplicación las peticiones http
// ==================================================================
process.env.PORT = process.env.PORT || 3000; // Si existe un valor o número de puerto en esta variable global del sistema nuestra aplicación escuchará las peticiones http por este, de lo contrario, si no existe escuchará las peticiones por el puerto 3000 en este caso

// ==================================================================
//  ENVAIROMENT o ENTORNO 
// ==================================================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'; // Variable de entorno que emplean los servidores (por ejemplo la usa Heroku) para definir el AMBIENTE o ENVAIROMENT de trabajo (producción o desarrollo)

// ==================================================================
//  BASE DE DATOS definir la url para la conexión a la base de datos
// ==================================================================
let urlDB; // Declaración de la variable que almacenará la url para la conexión a la DB

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'
} else {
    urlDB = 'mongodb+srv://cafe:123@cluster0.rtiyk.mongodb.net/cafe?retryWrites=true&w=majority';
}

process.env.URL_DB = urlDB;