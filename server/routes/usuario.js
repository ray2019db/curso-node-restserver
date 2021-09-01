const express = require('express'); // Importa la librería del framework express

const bcrypt = require('bcrypt'); // Importar el paquete "bcrypt" para encriptar la contraseña

const _ = require('underscore'); // Importa la librería "underscore" "_" para aportar muchísima funcionalidad a JavaScript

const Usuario = require('../models/usuario'); // Importar el modelo de Usuario para usarlo en este archivo cada vez que se haga referencia a un usuario de la DB de MongoDB. Se inicia en mayúscula por convención pero no es obligatorio

const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion'); // Importar Middleware para verificar el token (función verificaToken) y el role de administrador (función verificaAdminRole)

const app = express(); // Almacena el método express para poder usar todas sus propiedades, métodos, middleware, etc de este poderoso framework

// =========================================================================================================================================
// GET Método para LISTAR (obtener) una lista de usuarios almacenados en la DB
// =========================================================================================================================================
app.get('/usuario', verificaToken, (req, res) => { // Ruta para peticiones "get". Contiene 3 parámetros, el 1ro es un string con la ruta "/usuario", el 2do es un middleware (función verificaToken sin los () para que no se ejecute) ubicada en "middlewares/autenticación.js" que verificará el token enviado por el usuario en el header de la petición y si no es correcto detiene el código y no continúa y el 3ro es un callback que recibe dos parámetros, la petición (req) y la respuesta (res)

    let desde = (req.query.desde) || 0; // Almacena el valor a partir del cual quiero que me muestren los registros de la búsqueda. El "req.query.desde" es el valor pasado por párametro mediante la url de la petición (http://localhost:3000/usuario?desde=req.query.desde). Si no viene ningún valor por la url desde = 0
    desde = Number(desde); // Convierte el valor pasado por parámetro a valor numérico

    let limite = req.query.limite || 5; // Almacena la cantidad de registros a mostrar por página, si no viene ningún valor por url limite = 5
    limite = Number(limite); // Convierte el valor pasado por parámetro a valor numérico

    Usuario.find({ estado: true }, 'nombre email role estado google img') // De la colección (tabla) de "usuarios" (modelo o esquema "Usuario") obten los registros (documentos o usuarios) cuyo campo "estado" sea "true" ({estado : true}). Como segundo parámetro se indican los campos de cada usuario que queremos que devuelva ('nombre email role estado google img'). El "Usuario" hace referencia al esquema o modelo de usuario y representa la colección de usuarios en la DB de MongoDB
        .skip(desde) // El "skip" (salta) indica a partir de que punto quiero que me muestre los resultados, en este caso quiero que se salte la cantidad de registros enviados en la variable "desde"
        .limit(limite) // el "limit()" indica la cantidad de registros que quiero obtener, en este caso quiero 5 registros o usuarios
        .exec((err, usuarios) => { // El "exec" execute ejecuta una función callback que devuelve o un error "err" o los usuarios que coincidan con los términos de búsqueda
            if (err) { // Si devuelve un error haz lo sgte
                return res.status(400).json({ // Envía un código de estado 'status()' y un mensaje en formato JSON '.json()'. En este caso el estado (400) significa 'Bad Request' petición erronea
                    ok: false,
                    err
                });
            }
            Usuario.countDocuments({ estado: true }, (err, totalUsuarios) => { // El método "countDocuments()" cuenta el total de registros de la colección de usuarios cuyo campo "estado" es "true" ({estado: true}) y devuelve en un callback o un error "err" o el número total de documentos (usuarios) de esta colección que cumplan con la condición del "estado"
                res.json({ // Envía la respuesta en formato JSON 'json()'
                    ok: true,
                    usuarios,
                    total: totalUsuarios
                });
            })
        });
});

// =========================================================================================================================================
// POST Método para CREAR (Guardar) un usuario en la DB
// =========================================================================================================================================
app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => { // Ruta para peticiones "post". Contiene 3 parámetros, el 1ro es un string con la ruta "/usuario", el 2do es un middleware (función verificaToken sin los () para que no se ejecute) ubicada en "middlewares/autenticación.js" que verificará el token enviado por el usuario en el header de la petición y si no es correcto detiene el código y no continúa y el 3ro es un callback que recibe dos parámetros, la petición (req) y la respuesta (res)
    let body = req.body; // Almacena en un objeto el cuerpo de la petición

    let usuario = new Usuario({ // Almacena un usuario bajo el esquema o patrón de usuario creado como modelo (new Usuario()) en el archivo '../models/usuario'
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), // El "bcrypt" para encriptar la contraseña, el "hashSync()" para que haga el Hash de forma síncrona (o sea en el momento sin usar callbacks o promesas de forma asíncrona). El primes parámetro es el password en texto plano y el segundo "10" es el número de vueltas o veces que quiero aplicarle a este Hash
        role: body.role
            // la key 'img:' no se pone ya que no es obligatoria (required: false), el 'estado:' y 'google:' tampoco hacen falta ya que tomarán los valores por defecto (default: '...') ver el modelo de Usuario
    });

    usuario.save((err, usuarioDB) => { // Salva en la colección de 'usuarios' de la DB 'cafe' de MongoDB el usuario anterior (let usuario). El método save() devuelve o un error (err) o el usuario almacenado correctamente en la DB (usuarioDB)
        if (err) { // Si devuelve un error haz lo sgte
            return res.status(400).json({ // Envia un código de estado 'status()' y un mensaje en formato JSON '.json()'. En este caso el estado (400) significa 'Bad Request' petición erronea
                ok: false,
                err
            });
        }
        res.json({ // Envía está respuesta en formato JSON 'json() si se almacenó el usuario correctamente en la DB
            ok: true,
            usuario: usuarioDB
        });
    });
});

// =========================================================================================================================================
// PUT Método para ACTUALIZAR un usuario en la DB
// =========================================================================================================================================
app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => { // Ruta para peticiones "put". Contiene 3 parámetros, el 1ro es un string con la ruta "/usuario/:id", el 2do es un middleware (función verificaToken sin los () para que no se ejecute) ubicada en "middlewares/autenticación.js" que verificará el token enviado por el usuario en el header de la petición y si no es correcto detiene el código y no continúa y el 3ro es un callback que recibe dos parámetros, la petición (req) y la respuesta (res)
    let id = req.params.id // Almacena el "id" que viene por parámetro en la url de la petición http
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']); // Almacena la información que viene en el cuerpo de la petición http "body" filtrada con la librería "underscore" para almacenar solo los campos del objeto "req.body" que me interesa sean modificados

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, usuarioDB) => { // Encuentra y actualiza el usuario en la DB cuyo id coincida con el id pasado por parámetro en la url. El 2do parámetro es el "body" o cuerpo de la petición que contiene los datos a actualizar en el usuario. El 3er parámetro es un objeto con las opciones del método "findByIdAndUpdate()" de mongoose, la key "new: true" es para que retorne los datos del usuario ya actualizados en la función callback que sigue como 4to parámetro, el "runValidators: true" es para que cumpla con las validaciones aplicadas en el modelo o esquema del usuario de mongoose y el "context: 'query'" es para que funcione la validación "unique: true" aplicada en el modelo o esquema de usuario si usas el plugin "mongoose-unique-validator" de lo contrario te dará error. Por último viene el 4to parámetro que es un callback que retornará o un error "err" o el usuario con sus datos actualizados "usuarioDB"
        if (err) { // Si la función callback devuelve un error haz lo sgte
            return res.status(400).json({ // Envia un código de estado 'status()' y un mensaje en formato JSON '.json()'. En este caso el estado (400) significa 'Bad Request' petición erronea y retorna (no sigas ejecutando el código que continúa)
                ok: false,
                err
            });
        }
        res.json({ // Si no exite ningún error devuelve los datos ya actualizados del usuario en cuestión
            ok: true,
            usuario: usuarioDB
        });
    });
});

// =========================================================================================================================================
// DELETE Método para ELIMINAR realmente DESHABILITAR (no mostrarlo) un usuario en la DB, realmente ACTUALIZA el campo "estado: false" del usuario en cuestión para no perder la integridad referencial en la DB
// =========================================================================================================================================
app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => { // Elimina el usuario (deshabilita el usuario no lo borra solo cambia el {estado : false}) cuyo "id" venga por parámetro en la url de la petición http. El 2do parámetro es un middleware (función verificaToken sin los () para que no se ejecute) ubicada en "middlewares/autenticación.js" que verificará el token enviado por el usuario en el header de la petición y si no es correcto detiene el código y no continúa (no podrá eliminar el usuario en este caso)

    let id = req.params.id; // Almacena el "id" que viene por parámetro en la url. El "id" de "req.params.id" es el id que se daclara en la ruta "/usuario/:id", si por ej: fuera "/usuario/:id_usuario" entonces quedaría así "req.params.id_usuario"
    let cambiaEstado = { estado: false }; // Almacena el objeto {estado: false} que será pasado como "body" del método "findByIdAndUpdate()" empleado más abajo. Será cambiado el valor del campo "estado" (modelo o esquema de Usuario) a "false" del usuario cuyo id coincida con el "id" pasado por parámetro en la url
    let options = { new: true, runValidators: true, context: 'query' } // Almacena un objeto con las opciones del método "findByIdAndUpdate()". La key "new: true" es para que retorne los datos del usuario ya actualizados en la función callback que sigue como 4to parámetro, el "runValidators: true" es para que cumpla con las validaciones aplicadas en el modelo o esquema del usuario de mongoose y el "context: 'query'" es para que funcione la validación "unique: true" aplicada en el modelo o esquema de usuario si usas el plugin "mongoose-unique-validator" de lo contrario te dará error

    Usuario.findByIdAndUpdate(id, cambiaEstado, options, (err, usuarioBorrado) => { // Marca como eliminado (key {estado: false}) si existe el usuario cuyo id coincida con el id pasado por parámetro en la url. Como primer parámetro se pasa el "id" del usuario que se desea marcar como eliminado, el segundo parámetro "cambiaEstado" es el valor que se quiere actualizar en el usuario en cuestión, el 3er parámetro "options" son las opciones del método "findByIdAndUpdate()" y el 4to parámetro es un callback que devuelve o un error "err" o el usuario marcado como eliminado "usuarioBorrado" si todo es correcto

        if (err) { // Si la función callback devuelve un error haz lo sgte
            return res.status(400).json({ // Envia un código de estado 'status()' y un mensaje en formato JSON '.json()'. En este caso el estado (400) significa 'Bad Request' petición erronea y retorna (no sigas ejecutando el código que continúa)
                ok: false,
                err
            });
        }
        if (!usuarioBorrado) { // Si no existe ningún error pero el usuario no existe en la DB haz lo sgte
            return res.status(400).json({ // Envia un código de estado 'status()' y un mensaje en formato JSON '.json()'. En este caso el estado (400) significa 'Bad Request' petición erronea y retorna (no sigas ejecutando el código que continúa)
                ok: false,
                err: { message: 'El usuario no existe' }
            });
        }
        res.json({ // Si no exite ningún error devuelve los datos ya actualizados del usuario en cuestión
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app; // Se exporta "app" totalmente y no un objeto "{key: valor}" para poder utilizar todos los métodos, propiedades y middleware que este contiene






// =========================================================================================================================================
// DELETE Método para ELIMINAR un usuario en la DB. Actualmente ya no se eliminan los registros en la DB simplemente se marcan como eliminados para no perder la identidad referencial
// =========================================================================================================================================
// app.delete('/usuario/:id', (req, res) => { // Elimina el usuario cuyo "id" venga por parámetro en la url de la petición http

//     let id = req.params.id; // Almacena el "id" que viene por parámetro en la url. El "id" de "req.params.id" es el id que se daclara en la ruta "/usuario/:id", si por ej: fuera "/usuario/:id_usuario" entonces quedaría así "req.params.id_usuario"

//     Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => { // Elimina si existe el usuario cuyo id coincida con el id pasado por parámetro en la url. Como primer parámetro se pasa el "id" del usuario que se desea eliminar y el segundo parámetro es un callback que devuelve o un error "err" o el usuario eliminado "usuarioBorrado" si todo es correcto

//         if (err) { // Si la función callback devuelve un error haz lo sgte
//             return res.status(400).json({ // Envia un código de estado 'status()' y un mensaje en formato JSON '.json()'. En este caso el estado (400) significa 'Bad Request' petición erronea y retorna (no sigas ejecutando el código que continúa)
//                 ok: false,
//                 err
//             });
//         }
//         if (!usuarioBorrado) { // Si no existe ningún error pero el usuario no existe haz lo sgte
//             return res.status(400).json({ // Envia un código de estado 'status()' y un mensaje en formato JSON '.json()'. En este caso el estado (400) significa 'Bad Request' petición erronea y retorna (no sigas ejecutando el código que continúa)
//                 ok: false,
//                 err: { message: 'El usuario no existe' }
//             });
//         }
//         res.json({ // Si el usuario es eliminado correctamente devuelve lo sgte
//             ok: true,
//             usuario: usuarioBorrado
//         });

//     });

// });