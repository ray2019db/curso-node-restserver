// ==================================================================
//  PUERTO por dónde escuchará la aplicación las peticiones http
// ==================================================================
process.env.PORT = process.env.PORT || 3000; // Si existe un valor o número de puerto en esta variable global del sistema nuestra aplicación escuchará las peticiones http por este, de lo contrario, si no existe escuchará las peticiones por el puerto 3000 en este caso