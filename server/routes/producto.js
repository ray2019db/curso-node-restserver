const express = require('express');

const app = express();

const Producto = require('../models/producto');

const { verificaToken } = require('../middlewares/autenticacion');

// ==================================================================================================================================
// GET MOSTRAR TODOS LOS PRODUCTOS
// ==================================================================================================================================
app.get('/productos', verificaToken, (req, res) => {

    let limite = Number(req.query.limite) || 5;

    Producto.find({ disponible: true }) // Busca en la colección productos "Producto" todos los productos cuya condición "disponible" se cumpla "{disponible: true}"
        .limit(limite) // Muestra solo la cantidad de productos igual al valor numérico pasado por la url "req.query.limite" si no viene ningún valor por la url muestra "5" productos por defecto
        .populate('usuario', 'nombre email') // Muestra además del "_id" del usuario autenticado los campos "nombre" y "email"
        .populate('categoria', 'descripcion') // Muestra además dei "_id" de la categoría a la que pertenece el producto el campo "descripcion"
        .exec((err, productosDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos: productosDB
            });
        });
});

// ==================================================================================================================================
// GET MOSTRAR UN PRODUCTO POR EL ID
// ==================================================================================================================================
app.get('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    message: `No existe un producto con ese Id: ${id}`
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

// ==================================================================================================================================
// GET BUSCAR PRODUCTOS POR UN TÉRMINO DE BÚSQUEDA
// ==================================================================================================================================

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino; // Almacena el término de búsqueda (palabra que quiero buscar) que viene como parámetro "req.params.termino" mediante la url
    let regExp = new RegExp(termino, 'i'); // Almacena en una expresión "new ExpReg()" regular el término de búsqueda "termino" que viene como parámetro en la url. El 1er parámetro es el término de búsqueda al que quiero aplicarle la expresión regular (cualquier coincidencia de palabras con el término de búsqueda), el 2do parámetro es para hecerlo insensible "i" a las mayúsculas y minúsculas

    Producto.find({ nombre: regExp }) // Busca en la colección "productos" todos los productos que tengan alguna coincidencia con el término de búsqueda convertido a expresión regular
        .populate('categoria', 'descripcion') // Muestra además del "_id" de la categoría el campo de descripción de dicha categoría a la que pertenece el producto encontrado en la búsqueda
        .exec((err, productosDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (productosDB.length === 0) { // Si no encuentra ningún producto que coincida con la expresión regular del término de búsqueda haz lo sgte
                return res.status(400).json({
                    ok: false,
                    message: `No existe un producto ${termino}`
                });
            }
            res.json({
                ok: true,
                productos: productosDB
            });
        });
});

// ==================================================================================================================================
// POST CREAR UN PRODUCTO
// ==================================================================================================================================
app.post('/productos', verificaToken, (req, res) => {

    let body = req.body;
    let usuario = req.usuario;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                message: 'No se inserto correctamente el producto'
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

// ==================================================================================================================================
// PUT ACTUALIZAR UN PRODUCTO
// ==================================================================================================================================
app.put('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, productoUpdate) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoUpdate) {
            return res.status(400).json({
                ok: false,
                message: `No existe un producto con ese Id: ${id}`
            });
        }
        res.json({
            ok: true,
            producto: productoUpdate
        });
    });
});

// ==================================================================================================================================
// DELETE ELIMINAR UN PRODUCTO
// ==================================================================================================================================
app.delete('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true, runValidators: true, context: 'query' }, (err, productoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoEliminado) {
            return res.status(400).json({
                ok: false,
                message: `No existe un producto con ese Id: ${id}`
            });
        }
        res.json({
            ok: true,
            message: `El producto ${productoEliminado.nombre} ha sido eliminado con éxito`,
            producto: productoEliminado
        });
    });
});

module.exports = app;