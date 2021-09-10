const express = require('express'); // Importa la librería del framework express

const app = express(); // Almacena el método express (framework) para poder usar todas sus propiedades, métodos, middleware, etc de este poderoso framework

const Categoria = require('../models/categoria'); // Almacena el modelo o esquema de "Categoria", en otras palabras cuando nos referimos a esta constante "Categoria" nos referimos a la colección de categorias de la DB

const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion'); // Importa los Middleware "verificaToken" y "verificaAdminRole" para intercalarlos en las rutas que se necesiten

// ==================================================================================================================================
// GET MOSTRAR TODAS LAS CATEGORIAS
// ==================================================================================================================================
app.get('/categoria', verificaToken, (req, res) => { // El Middleware "verificaToken" verifica que el usuario que haga esta petición tenga un token válido de lo contrario el código se detiene y no se muestran las categorías

    Categoria.find({}) // Haya todas las categorías "find({})" de la colección categorias de la DB
        .sort('descripcion') // Permite ordenar los elementos de la colección (en este caso las categorias). Se especifica el campo por el cual deseo ordenar los elementos de la colección como un string y el orden es "ascendente por defecto", si deseas un orden "descendente" puedes colocar un signo "-" delante del campo por el que quieres ordenar (por ej. '-descripcion')
        .populate('usuario', 'nombre email') // Permite cargar información de los campos "ObjectId" que existen dentro de la colección en cuestión (en este caso dentro de la colección categorias "Categoría"). El 1er parámetro es el nombre del campo dentro de la colección al que pertenece el "ObjectId" (en singular y en minúscula, en este caso se refiere al campo "usuario" que hace referencia a la colección "usuarios") y el 2do especifíca los campos que quiero (en este caso del usuario en cuestión) dentro de la colección (en este caso los campos del usuario en cuestión dentro de la colección "usuarios")
        .exec((err, categoriasDB) => { // Ejecuta "exec" (execute) este callback que devolverá o un error o las categorías almacenada en la DB
            if (err) { // Si existe un error:
                return res.status(500).json({
                    ok: false,
                    err
                });
            } // Si todo OK
            res.json({
                ok: true,
                categorias: categoriasDB
            });
        });
});

// ==================================================================================================================================
// GET MOSTRAR UNA CATEGORIA POR EL ID
// ==================================================================================================================================
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id; // Almacena el "id" de la categoría que viene como parámetro por la url "req.params.id"
    Categoria.findById(id, (err, categoriaDB) => { // Haya la categoría cuyo id coincida con el id que viene por parámetro, el 2do parámetro es un callback que devuelve o un error o una categoría de la DB "categoriaDB"
        if (err) { // Si existe un error:
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) { // Si no hay error pero no existe la categoría:
            return res.status(400).json({
                ok: false,
                mesage: `No existe una categoría con ese Id: ${id}`
            });
        } // Si todo OK:
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ==================================================================================================================================
// POST CREAR UNA CATEGORIA
// ==================================================================================================================================
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body; // Almacena el cuerpo de la petición "body". El cuerpo de la petición viene mediante la url de la petición y es opbtenido gracias al "bodyParser" (en este caso no usamos el paquete que se instala con npm utilizamos el que viene en express)

    let categoria = new Categoria({ // Instancio la categoría "new Categoria()" de tipo "Categoria" o sea esta variable "let categoria" almacenará una categoría con la misma estructura del modelo o esquema "Categoria" declarado en el archivo "../models/categoria"
        descripcion: body.descripcion,
        usuario: req.usuario._id // Almacena el usuario entregado por el middleware "verificaToken" en la petición "req.usuario"
    });
    categoria.save((err, categoriaDB) => { // Salva o guarda la categoría en la colección de categoias de la DB. El método "save()" devuelve o un error "err" o una categoría guardada en la DB "categoriaDB" si todo OK
        if (err) { // Si existe un error:
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) { // Si no existe error pero no existe tampoco la categoría:
            return res.status(400).json({
                ok: false,
                message: 'Debe insertar una categoría'
            });
        } // Si todo OK
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ==================================================================================================================================
// PUT ACTUALIZAR O CAMBIAR EL NOMBRE DE UNA CATEGORIA
// ==================================================================================================================================
app.put('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let body = req.body; // Almacena el cuerpo de la petición con los datos que se quieren actualizar que viene en la url y se optiene mediante el bodyParser integrado en express
    let id = req.params.id; // Almacena el "id" pasado como parámetro mediante la url de la petición http

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, categoriaUpdate) => { // Encuentra una categoría cuyo id coincida con el id que viene como parámetro mediante la url y actualízala con los datos enviados por el url en el "body", el 3er parámetro son las opciones y el 4to es un callback que devuelve o un error "err" o una categoría actualizada "categoriaUpdate"
        if (err) { // si existe un error:
            return res.status(500).json({
                ok: false,
                err
            });
        } // Si no existe un error pero tampoco existe la categoría:
        if (!categoriaUpdate) {
            return res.status(400).json({
                ok: false,
                mesage: 'No existe esta categoría'
            });
        } // Si todo OK:
        res.json({
            ok: true,
            categoria: categoriaUpdate
        });
    });
});

// ==================================================================================================================================
// DELETE ELIMINAR UNA CATEGORIA POR SU ID
// ==================================================================================================================================
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id; // Almacena el id de la categoría a eliminar en la DB que viene como parámetro en la url de la petición http

    Categoria.findByIdAndRemove(id, (err, categoriaEliminada) => { // Haya la categoría cuyo id coincida con el id que viene como parámetro en la url y elimínala. El 1er parámetro es el "id" y el 2do es un callback que devuelve o un error o la categoría eliminada en la DB "categoriaEliminada"
        if (err) { // Si existe un error:
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaEliminada) { // Si no hay error pero no existe la categoría a eliminar:
            return res.status(400).json({
                ok: false,
                mesage: 'No existe esta categoría'
            });
        } // Si todo OK:
        res.json({
            ok: true,
            message: 'Categoría Eliminada',
            categoria: categoriaEliminada
        });
    });
});

module.exports = app;