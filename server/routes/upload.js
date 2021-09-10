const express = require('express'); // Importar el framework express
const fileUpload = require('express-fileupload'); // Importar el paquete "express-fileupload" para poder subir archivos al servidor
const app = express(); // Almacena el método express para poder usar todos sus métodos, propiedades, middlewares, etc
const fs = require('fs'); // Importar el File System en NOde "fs" para poder trabajar con los archivos guardados en el servidor. No hay que hacer "npm" ya viene con Node
const path = require('path'); // Importar el path en Node "path" para poder trabajar con las rutas de los archivos guardados en el servidor (ruta o path absolutos) con el método "resolve()". No hay que hacer "npm" ya viene con Node
const Usuario = require('../models/usuario'); // Importar la colección de usuarios (modelo o esquema de Usuario)
const Producto = require('../models/producto'); // Importar la colección de productos (modelo o esquema de Producto)

// default options Middelware
app.use(fileUpload()); // Middleware que coloca cualquier archivo que subamos mediante una petición url en el objeto "req.files" (similar al bodyParser para usar el "req.body")

// ==================================================================================================================================
// PUT RUTA PARA ACTUALIZAR O SUBIR ARCHIVOS AL SERVIDOR
// ==================================================================================================================================
app.put('/upload/:tipo/:id', function(req, res) { // La ruta sería algo como esto "http://localhost:3000/upload/usuarios/123456asddfg". Utilizo un "PUT" en lugar de un "POST" porque no solo voy a subir archivos al servidor sino que voy a actualizarlos también, se puede usar un "POST" también y funcionaría correctamente solo es cuestión de mantener el estándar

    let tipo = req.params.tipo; // Almacena el tipo (usuarios o productos) pasado como parámetro por la url
    let id = req.params.id; // Almacena el id (del usuarios o del productos) pasado como parámetro por la url

    // VALIDAR TIPO DE ARCHIVO (USUARIOS O PRODUCTOS). LO COMPRUEBA EN LA RUTA O URL
    let tiposPermitidos = ['usuarios', 'productos']; // Almacena en un arreglo los tipos permitidos, en este caso ( usuarios o productos )
    if (tiposPermitidos.indexOf(tipo) < 0) { //Si no coincide el "tipo" pasado por url con un tipo dentro del arreglo "tiposPermitidos" haz lo sgte. Si "tiposPermitidos.indexOf(tipo)" retorna "-1" significa que el tipo pasado por url no coincide con ningún tipo almacenado en el arreglo "tiposPermitidos"
        return res.status(400).json({
            ok: false,
            err: { message: `No es un tipo permitido (${tiposPermitidos.join(' o ')})` }
        });
    } // ----------------FIN VALIDACIÓN TIPO------------------------------------------------------------------------------------------

    // VALIDAR LA SELECCIÓN DE UN ARCHIVO (NO PERMITIR QUE EL ARCHIVO VENGA VACÍO O SIN SELECCIONAR ALGÚN ARCHIVO)
    if (!req.files || Object.keys(req.files).length === 0) { // Si no se selecciona ningún archivo o viene un objeto vacío haz lo sgte
        return res.status(400).json({
            ok: false,
            err: { message: 'No se ha seleccionado ningún archivo' }
        });
    } // ----------------FIN VALIDAR SELECCIÓN DE ARCHIVO-------------------------------------------------------------------------------------------------------------

    // VALIDAR EXTENSIONES PERMITIDAS PARA LA CARGA O SUBIDA DE ARCHIVOS
    let archivo = req.files.archivo; // Almacena en un objeto el archivo con todas sus propiedades (archivo.name, archivo.size, etc) que se quiere subir al servidor
    let archivoSeparado = archivo.name.split('.'); // Almacena el nombre del archivo "req.files.archivo.name" o "archivo.name" separado donde exista un punto "." "split('.')". Almacena en un arreglo "[ 'nombre', 'extension' ]"
    let ext = archivoSeparado[archivoSeparado.length - 1]; // Almacena la extensión del archivo que queremos subir al servidor. Selecciona la última pocisión del arreglo "archivoSeparado" que no es más que la extensión del nombre del archivo
    let extPermitidas = ['jpg', 'jpeg', 'png', 'gif']; // Almacena en un arreglo todas las extensiones soportadas para subir archivos al servidor

    if (extPermitidas.indexOf(ext) < 0) { // Si no existe la entensión del archivo que queremos subir al servidor dentro del arreglo de extensiones permitidas haz lo sgte. Si el método "indexOf()" retorna "-1" significa que no encontró ninguna extensión dentro del arreglo "extPermitidas" que coincida con la extensión del archivo a subir "ext"
        return res.status(400).json({
            ok: false,
            err: {
                message: `La extensión del archivo no es ${extPermitidas.join(', ')}`,
                extensión: ext
            }
        });
    } // ---------------FIN DE EXTENSIONES PERMITIDAS-------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // CAMBIAR EL NOMBRE DEL ARCHIVO (para que cada archivo tenga un nombre único y no corra el riesgo que se sobre escriban)
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${ext}`;
    // -----------------FIN CAMBIO NOMBRE ARCHIVO----------------------------------------------------------------------------

    // MOVER EL ARCHIVO A LA RUTA ESPECIFICADA EN EL SERVIDOR
    archivo.mv(`./uploads/${tipo}/${nombreArchivo}`, (err) => { // Mueve o sube el "archivo" al servidor mediante el método "mv()". El 1er parámetro es la ruta donde deseamos guardar el "archivo" en el servidor "./uploads/${tipo}/${nombreArchivo}" y el 2do es un callback que retorna un error si existe o no hace nada si todo OK
        if (err) { // Si exite un error
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (tipo === 'usuarios') { // Si el "tipo" es "usuarios":
            imagenUsuario(id, res, nombreArchivo, tipo); // Almacena el nombre de la imagen (ej: "6127b702c1cae70ebcee9f7e-470.jpg") en el campo "img" de la DB 
        } else { // Si el "tipo" no es "usuarios", o sea es "productos":
            imagenProducto(id, res, nombreArchivo, tipo); // Almacena el nombre de la imagen (ej: "6127b702c1cae70ebcee9f7e-470.jpg") en el campo "img" de la DB 
        }
    });

});

// ==================================================================================================================================
// FUNCIÓN "imageUsuario" para guardar la imagen de usuario en el campo "img" del usuario en la DB
// ==================================================================================================================================
const imagenUsuario = (id, res, nombreArchivo, tipo) => { // Mando como parámetro la respuesta de la ruta "res" ya que esta función está fuera del contexto de la ruta

    Usuario.findById(id, (err, usuarioDB) => { // Haya un usuario en la DB cuyo "id" coincida con el "id" pasado por url. El método "findById()" devuelve o un error "err" si existe o un usuario de la DB si todo OK
        if (err) { // Si existe un error:
            borrarArchivoSiExiste(tipo, nombreArchivo); // Elimina la imagen o archivo guardado con el método "mv()" anteriormente para no acumular archivos innecesarios en el servidor
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) { // Si no existe error pero no existe el usuario en la DB
            borrarArchivoSiExiste(tipo, nombreArchivo); // Elimina la imagen o archivo guardado con el método "mv()" anteriormente para no acumular archivos innecesarios en el servidor
            return res.status(400).json({
                ok: false,
                err: { message: `No existe un Usuario con ese Id: ${id}` }
            });
        } // Si todo OK

        borrarArchivoSiExiste(tipo, usuarioDB.img); // Comprueba que ese usuario no tenga ninguna imagen o archivo (nombre de imagen almacenado en el campo "img"), de existir elimínala para evitar se acumulen archivos innecesarios en el servidor

        usuarioDB.img = nombreArchivo; // Almacena el nombre del archivo en la clave "img" del usuario de la DB "usuarioDB.img"

        usuarioDB.save((err, usuarioGuardado) => { // Guarda el "usuarioDB" en la DB. El método "save()" devuelve o un error "err" o el usuario guardado en la DB "usuarioGuardado"
            if (err) { // Si existe un error:
                return res.status(500).json({
                    ok: false,
                    err
                });
            } // Si todo OK
            res.json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
};

// ==================================================================================================================================
// FUNCIÓN "imageProducto" para guardar la imagen del producto en el campo "img" del producto en la DB
// ==================================================================================================================================
const imagenProducto = (id, res, nombreArchivo, tipo) => { // Mando como parámetro la respuesta de la ruta "res" ya que esta función está fuera del contexto de la ruta

    Producto.findById(id, (err, productoDB) => { // Haya un producto en la DB cuyo "id" coincida con el "id" pasado por url. El método "findById()" devuelve o un error "err" si existe o un producto de la DB si todo OK
        if (err) { // Si existe un error:
            borrarArchivoSiExiste(tipo, nombreArchivo); // Elimina la imagen o archivo guardado con el método "mv()" anteriormente para no acumular archivos innecesarios en el servidor
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) { // Si no existe error pero no existe el producto en la DB
            borrarArchivoSiExiste(tipo, nombreArchivo); // Elimina la imagen o archivo guardado con el método "mv()" anteriormente para no acumular archivos innecesarios en el servidor
            return res.status(400).json({
                ok: false,
                err: { message: `No existe un Producto con ese Id: ${id}` }
            });
        } // Si todo OK

        borrarArchivoSiExiste(tipo, productoDB.img); // Comprueba que ese producto no tenga ninguna imagen o archivo (nombre de imagen almacenado en el campo "img"), de existir elimínala para evitar se acumulen archivos innecesarios en el servidor

        productoDB.img = nombreArchivo; // Almacena el nombre del archivo en la clave "img" del producto en la DB "productoDB.img"

        productoDB.save((err, productoGuardado) => { // Guarda el "productoDB" en la DB. El método "save()" devuelve o un error "err" o el producto guardado en la DB "productoGuardado"
            if (err) { // Si existe un error:
                return res.status(500).json({
                    ok: false,
                    err
                });
            } // Si todo OK
            res.json({
                ok: true,
                producto: productoGuardado
            });
        });
    });
};


// ==================================================================================================================================
// BORRAR ARCHIVO SI EXISTE EN EL SERVIDOR PARA QUE NO SE LLENE DE ARCHIVOS INNECESARIOS
// ==================================================================================================================================
const borrarArchivoSiExiste = (tipo, nombreImagen) => { // Paso como parámetro el "tipo" (usuarios o productos) y el nombre de la imagen "nombreImagen" para comprobar si ese usuario o producto tienen ya alguna imagen en el servidor
    let pathArchivo = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`); // Almacena la ruta o path con el nombre de la imagen que quiero comprobar más abajo si existe
    if (fs.existsSync(pathArchivo)) { // Si el path con la imagen existe:
        fs.unlinkSync(pathArchivo); // Elimina la imagen o archivo de esa ruta
    }
};


module.exports = app; // Exportar "app" para poder usar este módulo fuera de este archivo