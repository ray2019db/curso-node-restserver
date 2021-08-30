// ==================================================================
//  PUERTO por dónde escuchará la aplicación las peticiones http
// ==================================================================
process.env.PORT = process.env.PORT || 3000; // Si existe un valor o número de puerto en esta variable global del sistema (servidor donde se despliega nuestra aplicación) nuestra aplicación escuchará las peticiones http por este, de lo contrario, si no existe escuchará las peticiones por el puerto 3000 en este caso

// ==================================================================
//  ENVIROMENT o ENTORNO 
// ==================================================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'; // Variable de entorno que emplean los servidores (por ejemplo la usa Heroku) para definir el AMBIENTE o ENVIROMENT de trabajo (producción o desarrollo)

// ==================================================================
//  BASE DE DATOS definir la url para la conexión a la base de datos
// ==================================================================
let urlDB; // Declaración de la variable que almacenará la url con el user y el password para la conexión a la DB

if (process.env.NODE_ENV === 'dev') { // Si la variable de global de entorno "process.env.NODE_ENV" no tiene ningún valor diferente a "dev" (significa que la aplicación no está corriendo en ningún servidor y estamos en la PC como local) y entonces toma el valor "dev" (process.env.NODE_ENV = 'dev') usa la sgte url para establecer la conexión a la Db (urlDB = 'mongodb://localhost:27017/cafe')
    urlDB = 'mongodb://localhost:27017/cafe' // URL para conectarse a la DB de MongoDB cuando corre como local
} else { // Si la variable de entorno global "process.env.NODE_ENV" tiene un valor diferente a ('dev' develoment) significa que la aplicación esta corriendo en un servidor de desarrollo usa la url que está a continuación
    urlDB = process.env.URL_DB; // URL para conectarse a la DB de MongoDB cuando corre en un servidor de producción (en este caso Heroku). Se creó la variable de entorno "URL_DB" directamente en Heroku mediane el comando (heroku config:set URL_DB="mongodb+srv://cafe:123@cluster0.rtiyk.mongodb.net/cafe?retryWrites=true&w=majority") y así de esta manera nadie puede ver el usuario y la contraseña para conectarse a la DB ya que Heroku es el único que la conoce y la almacena en la variable creada anteriormente
    // urlDB = 'mongodb+srv://cafe:123@cluster0.rtiyk.mongodb.net/cafe?retryWrites=true&w=majority'; // URL para conectarse a la DB de MongoDB cuando corre en un servidor de producción (por ej. Heroku). Este método no es seguro pues si alguien tiene acceso a este archivo quedaría expuesta la url de conexión a la DB con el user y el password, en la práctica se emplea el método anterior
}

process.env.URL_DB_MONGO = urlDB; // Almacena en la variable de entorno global "process.env.URL_DB_MONGO" la url para establecer la conexión a la DB