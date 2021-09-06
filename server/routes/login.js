const express = require('express'); // Importa la librería del framework express

const bcrypt = require('bcrypt'); // Importar el paquete "bcrypt" para encriptar la contraseña y trabajar con passwords encriptados

const jwt = require('jsonwebtoken');

// GOOGLE SignIn
// const { OAuth2Client } = require('google-auth-library');
// const client = new OAuth2Client(process.env.CLIENT_ID);

const app = express(); // Almacena el método express para poder usar todas sus propiedades, métodos, middleware, etc de este poderoso framework

const Usuario = require('../models/usuario'); // Hace referencia a la colección de usuarios de la DB (modelo o esquema de usuario)

app.post('/login', (req, res) => {

    let body = req.body; // Almacena el cuerpo (req.body) de la petición http mediante el bodyParser (middlewares urlencoded() y json()) de express aplicado en el archivo "server.js"

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => { // Encuentra en la colección de usuarios (Usuario) un usuario cuyo "email" coincida con email que viene en el "req.body" de la petición

        if (err) { // Si la función callback devuelve un error haz lo sgte
            return res.status(500).json({ // Envia un código de estado 'status()' y un mensaje en formato JSON '.json()'. En este caso el estado (500) significa 'Internal Server Error' error interno del servidor y retorna (no sigas ejecutando el código que continúa)
                ok: false,
                err
            });
        }
        if (!usuarioDB) { // Si no existe ningún error pero tampoco existe un usuario que coincida con el email
            return res.status(400).json({ // Envia un código de estado 'status()' y un mensaje en formato JSON '.json()'. En este caso el estado (400) significa 'Bad Request' petición erronea y retorna (no sigas ejecutando el código que continúa)
                ok: false,
                err: { message: 'Correo incorrecto' }
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) { // Si no coincide el password que viene en el "req.body" una vez que sea encriptado (bcrypt()) con el password del usuario en cuestión haz lo sgte. El método "bcrypt.compareSync(body.password, usuarioDB.password)" encripta lo que viene en el 1er parámetro y lo compara con el 2do parámetro ya encriptado y devuelve un boolean (true si coincide o false en caso contrario)
            return res.status(400).json({ // Envia un código de estado 'status()' y un mensaje en formato JSON '.json()'. En este caso el estado (400) significa 'Bad Request' petición erronea y retorna (no sigas ejecutando el código que continúa)
                ok: false,
                err: { message: 'Contraseña incorrecta' }
            });
        } // Si existe el usuario, coinciden los passwords y no hay ningún error haz lo sgte

        let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, { expiresIn: process.env.EXPIRA }); // Almacena el token generado por el método "jwt.sign()". El 1er parámetro es un objeto que contendrá el payload (información personal del usuario en este caso), el 2do es la semilla o SEED del token (cualquier texto para conformar la clave secreta del token) y el 3ro es el tiempo para que expire el token (tiempo de vida del token se da en Segundos)

        res.json({ // Envía la respuesta en formato JSON 'json()'
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});

// ================================================================================================================================
// CONFIGURACIONES DE GOOGLE SIGNIN
// ================================================================================================================================
// async function verify(token) {

//     const ticket = await client.verifyIdToken({
//         idToken: token,
//         audience: process.env.CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
//     });
//     const payload = ticket.getPayload();

//     console.log(payload.name);
//     console.log(payload.email);
// }

// app.post('/google', (req, res) => {

//     let token = req.body.idtoken;

//     verify(token);

//     res.json({ // Envía la respuesta en formato JSON 'json()'
//         token
//     });
// });

module.exports = app; // Se exporta "app" totalmente y no un objeto "{key: valor}" para poder utilizar todos los métodos, propiedades y middleware que este contiene