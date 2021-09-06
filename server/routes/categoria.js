const express = require('express'); // Importa la librería del framework express

const app = express(); // Almacena el método express (framework) para poder usar todas sus propiedades, métodos, middleware, etc de este poderoso framework

const Categoria = require('../models/categoria');

const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');


// ==================================================================================================================================
// GET MOSTRAR TODAS LAS CATEGORIAS
// ==================================================================================================================================
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion') // Permite ordenar los elementos de la colección (en este caso las categorias). Se especifica el campo por el cual deseo ordenar los elementos de la colección como un string y el orden es "ascendente por defecto", si deseas un orden "descendente" puedes colocar un signo "-" delante del campo por el que quieres ordenar (poe ej. '-descripcion')
        .populate('usuario', 'nombre email') // Permite cargar información de los campos "ObjectId" que existen dentro de la colección en cuestión (en este caso dentro de la colección categorias "Categoría"). El 1er parámetro es el nombre del campo dentro de la colección al que pertenece el "ObjectId" (en singular y en minúscula, en este caso se refiere al campo "usuario" que hace referencia a la colección "usuarios") y el 2do especifíca los campos que quiero del documento en cuestión dentro de la colección (en este caso los campos del usuario en cuestión dentro de la colección "usuarios")
        .exec((err, categoriasDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
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
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                mesage: `No existe una categoría con ese Id: ${id}`
            });
        }
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
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                message: 'Debe insertar una categoría'
            });
        }
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
    let body = req.body;
    let id = req.params.id;
    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, categoriaUpdate) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaUpdate) {
            return res.status(400).json({
                ok: false,
                mesage: 'No existe esta categoría'
            });
        }
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
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaEliminada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaEliminada) {
            return res.status(400).json({
                ok: false,
                mesage: 'No existe esta categoría'
            });
        }
        res.json({
            ok: true,
            message: 'Categoría Eliminada',
            categoria: categoriaEliminada
        });
    });
});



module.exports = app;