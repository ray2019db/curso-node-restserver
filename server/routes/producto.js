const express = require('express'); // Importa el paquete (framework) express

const app = express(); // Almacena el método express para poder emplear todos sus métodos, propiedades y middlewares

const Producto = require('../models/producto'); // Almacena el modelo o esquema de "Producto" para poder emplear la colección "productos" de la DB

const { verificaToken } = require('../middlewares/autenticacion'); // Importa el middleware "verificaToken" para poder emplearlo en las rutas

// ==================================================================================================================================
// GET MOSTRAR TODOS LOS PRODUCTOS
// ==================================================================================================================================
app.get('/productos', verificaToken, (req, res) => { // El middleware "verificaToken" se inserta e la ruta para comprobar que la petición viene con un token válido de lo contrario detiene el código y no muestra los productos solicitados

    let limite = Number(req.query.limite) || 5; // Almacena la cantidad de productos a mostrar en una página. Este valor viene como una query mediante la url "req.query.limite" de no venir el valor será "5" por defecto, el método "Number()" se emplea para garantizar que el valor sea de tipo "Number" y evutar que lo asocie con um tipo "String"

    Producto.find({ disponible: true }) // Busca en la colección productos "Producto" todos los productos cuya condición "disponible" se cumpla "{disponible: true}"
        .limit(limite) // Muestra solo la cantidad de productos igual al valor numérico pasado por la url "req.query.limite" si no viene ningún valor por la url muestra "5" productos por defecto
        .populate('usuario', 'nombre email') // Muestra además del "_id" del usuario autenticado los campos "nombre" y "email"
        .populate('categoria', 'descripcion') // Muestra además dei "_id" de la categoría a la que pertenece el producto el campo "descripcion"
        .exec((err, productosDB) => { // Ejecuta este callback que devolverá o un error "err" o el producto de la DB con todos los requisitos anteriores "productoDB"
            if (err) { // Si existe un error:
                return res.status(500).json({
                    ok: false,
                    err
                });
            } // Si todo OK
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

    let id = req.params.id; // Almacena el "id" del producto que viene como parámetro por la url "req.params.id"

    Producto.findById(id) // Haya en la DB un producto cuyo id coincida con el id pasado como parámetro mediante la url
        .populate('usuario', 'nombre email') // Si el producto existe además del id del usuario asociado a ese producto muestra los campos "nombre" y "email"
        .populate('categoria', 'descripcion') // Si el producto existe además del id de la categoría asociada a ese producto muestra el campo "descripcion"
        .exec((err, productoDB) => { // Ejecuta este callback que devolverá o un error "err" o el producto de la DB con todos los requisitos anteriores "productoDB"
            if (err) { // Si exite un error:
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) { // Si no hay error pero no existe el producto:
                return res.status(400).json({
                    ok: false,
                    message: `No existe un producto con ese Id: ${id}`
                });
            } // Si todo OK
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
        .exec((err, productosDB) => { // Ejecuta este callback que devolverá o un error "err" o los productos de la DB con todos los requisitos anteriores "productosDB"
            if (err) { // Si existe un error:
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
            } // Si todo OK
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

    let body = req.body; // Almacena el cuerpo de la petición "body". El cuerpo de la petición viene mediante la url de la petición y es opbtenido gracias la "bodyParser" (en este caso no usamos el paquete que se instala con npm utilizamos el que viene en express)
    let usuario = req.usuario; // Almacena el usuario entregado por el middleware "verificaToken" en la petición "req.usuario"
    let producto = new Producto({ // Instancio un producto "new Producto()" de tipo "Producto" o sea esta variable "producto" almacenará un producto con la misma estructura del modelo o esquema "Producto" declarado en el archivo "../models/producto"
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: usuario._id
    });

    producto.save((err, productoDB) => { // Salva o guarda el producto en la colección de productos de la DB. El método "save()" devuelve o un error "err" o un producto guardado en la DB "productoDB" si todo OK
        if (err) { // Si exite un error:
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) { // Si no existe error pero no existe el producto:
            return res.status(400).json({
                ok: false,
                message: 'No se inserto correctamente el producto'
            });
        } // Si todo OK
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

    let id = req.params.id; // Almacena el "id" pasado como parámetro mediante la url de la petición http
    let body = req.body; // Almacena el cuerpo de la petición con los datos que se quieren actualizar que viene en la url y se optiene mediante el bodyParser integrado en express

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, productoUpdate) => { // Encuentra un producto cuyo id coincida con el id que viene como parámetro mediante la url y actualízalo con los datos enviados por el url en el "body", el 3er parámetro son las opciones y el 4to es un callback que devuelve o un error "err" o un producto actualizado "productoUpdate"
        if (err) { // si existe un error:
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoUpdate) { // Si no existe un error pero tampoco existe el producto:
            return res.status(400).json({
                ok: false,
                message: `No existe un producto con ese Id: ${id}`
            });
        } // Si todo OK
        res.json({
            ok: true,
            producto: productoUpdate
        });
    });
});

// ==================================================================================================================================
// DELETE ELIMINAR UN PRODUCTO (Realmente no elimina el producto simplemente marca el canpo "disponible" del producto en la DB como "false")
// ==================================================================================================================================
app.delete('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id; // Almacena el id del producto a eliminar en la DB que viene como parámetro en la url de la petición http

    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true, runValidators: true, context: 'query' }, (err, productoEliminado) => { // Haya en la DB un producto cuyo id coincida con el id pasado por url y cambia el valor del campo "disponible" a "false" "{disponible: false}", el 4to parámetro devuelve un callback con un error "err" o con el producto eliminado (realmente no lo elimina simplemente lo marca como eliminado para que no se muestre) "productoEliminado"
        if (err) { // Si existe un error:
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoEliminado) { // Si no hay error pero no existe el producto a eliminar:
            return res.status(400).json({
                ok: false,
                message: `No existe un producto con ese Id: ${id}`
            });
        } // Si todo OK
        res.json({
            ok: true,
            message: `El producto ${productoEliminado.nombre} ha sido eliminado con éxito`,
            producto: productoEliminado
        });
    });
});

module.exports = app;