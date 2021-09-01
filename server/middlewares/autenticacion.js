const jwt = require('jsonwebtoken');

// =======================================================================
// VERIFICAR TOKEN
// =======================================================================
let verificaToken = (req, res, next) => { // Recibe 3 argumentos, el 1ro es la petición "req", el 2do es la respuesta que deseo retornar "res" y el 3ro es el "next" que permite continuar con la ejecución del código donde haya sido insertada está función (middleware) si la respuesta de esta es satisfactoria, de lo contrario (error o no cumple con las condiciones) se detiene el código

    let token = req.get('token'); // Contiene el token enviado en los Headers de la petición http. Se extrae del header de la petición mediante "req.get('token')". Otra forma muy común de enviar el token mediante el header de la petición es uasando la key "Authorization" en lugar de "token"

    jwt.verify(token, process.env.SEED, (err, tokenDecoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Token invalid',
                err
            });
        }
        req.usuario = tokenDecoded.usuario;
        next();
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


module.exports = { verificaToken, verificaAdminRole }; // Exporta las funciones (middleware) "verificaToken" y "verificaAdminRole" de este archivo