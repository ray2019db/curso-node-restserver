const jwt = require('jsonwebtoken');

// =======================================================================
// VERIFICAR TOKEN
// =======================================================================
let verificaToken = (req, res, next) => { // Recibe 3 argumentos, el 1ro es la petición "req", el 2do es la respuesta que deseo retornar "res" y el 3ro es el "next" que permite continuar con la ejecución del código donde haya sido insertada está función (middleware) si la respuesta de esta es satisfactoria, de lo contrario (error o no cumple con las condiciones) se detiene el código

    let token = req.get('token'); // Contiene el token enviado en los Headers de la petición http. Se extrae del header de la petición mediante "req.get('token')". Otra forma muy común de enviar el token mediante el header de la petición es uasando la key "Authorization" en lugar de "token"

    jwt.verify(token, process.env.SEED, (err, tokenDecoded) => { // Verifica el token enviado en el header de la petición mediante el método "jwt.verify()". Este recibe 3 parámetros, el 1ro es el "token" que viene en el header de la petición, el 2do es la semilla "SEED" o clave secreta almacenada en la variable de entorno "process.env.SEED" del archivo "config.js" y el 3ro es un callback que devuelve o un error "err" o un token decodificado "tokenDecoded" que contiene todos los datos del usuario en cuestión

        if (err) { // Si el callback devuelve un error haz lo sgte
            return res.status(401).json({ // Retorna un estado (401 Unauthorized "error de autenticación") con el sgte mensaje
                ok: false,
                message: 'Token invalid',
                err
            });
        }
        req.usuario = tokenDecoded.usuario; // Si el callback devuelve el token decodificado almacénalo en la petición http "req.usuario" para que sea entregado al callback de la ruta que llamó este middleware
        next(); // Continúa con la ejecución del código en la ruta que llamó este middleware
    });
};

// =======================================================================
// VERIFICAR ADMON_ROLE el rol de Administrador
// =======================================================================
let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario; // Almacena los datos del usuario "req.usuario" (payload) obtenido del middleware "verificaToken" y enviado en la petición "req". Son los datos del usuario que se autenticó

    if (req.usuario.role === 'USER_ROLE') { // Si el role del usuario autenticado es "USER_ROLE" (o sea no es "ADMIN_ROLE") haz lo sgte
        return res.status(401).json({ // Retorna un estatus 401 "Unauthorized" de error de autenticación con el sgte mensaje y no continúa ejecutando el código que sigue
            ok: false,
            message: 'Necesita privilegios de Administrador'
        });
    }
    next(); // Si el usuario es ADMIN_ROLE ejecuta el método "next()" para que continúe con el código donde se llamó este middleware
};

// =======================================================================
// VERIFICAR TOKEN POR LA URL por ej: "http://localhost:3000/imagen/usuarios/6127b702c1cae70ebcee9f7e-77.png"
// =======================================================================
let verificaTokenImg = (req, res, next) => { // Recibe 3 argumentos, el 1ro es la petición "req", el 2do es la respuesta que deseo retornar "res" y el 3ro es el "next" que permite continuar con la ejecución del código donde haya sido insertada está función (middleware) si la respuesta de esta es satisfactoria, de lo contrario (error o no cumple con las condiciones) se detiene el código

    let token = req.query.token; // Contiene el token enviado como parámetro en la url de la petición http. Se extrae del header de la petición mediante "req.query.token", por ej: "http://localhost:3000/imagen/usuarios/6127b702c1cae70ebcee9f7e-77.png?token=XXXXXXXX"

    jwt.verify(token, process.env.SEED, (err, tokenDecoded) => { // Verifica el token enviado como query en la url de la petición mediante el método "jwt.verify()". Este recibe 3 parámetros, el 1ro es el "token" que viene en la query de la url de la petición, el 2do es la semilla "SEED" o clave secreta almacenada en la variable de entorno "process.env.SEED" del archivo "config.js" y el 3ro es un callback que devuelve o un error "err" o un token decodificado "tokenDecoded" que contiene todos los datos del usuario en cuestión

        if (err) { // Si el callback devuelve un error haz lo sgte
            return res.status(401).json({ // Retorna un estado (401 Unauthorized "error de autenticación") con el sgte mensaje
                ok: false,
                message: 'Token invalid',
                err
            });
        }
        req.usuario = tokenDecoded.usuario; // Si el callback devuelve el token decodificado almacénalo en la petición http "req.usuario" para que sea entregado al callback de la ruta que llamó este middleware
        next(); // Continúa con la ejecución del código en la ruta que llamó este middleware
    });
};



module.exports = { verificaToken, verificaAdminRole, verificaTokenImg }; // Exporta las funciones (middleware) "verificaToken" y "verificaAdminRole" de este archivo