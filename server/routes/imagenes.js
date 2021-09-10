const express = require('express');

const path = require('path'); // Importar el path en Node "path" para poder trabajar con las rutas de los archivos guardados en el servidor (ruta o path absolutos) con el método "resolve()". No hay que hacer "npm" ya viene con Node

const fs = require('fs'); // Importar el File System en Node "fs" para poder trabajar con los archivos guardados en el servidor. No hay que hacer "npm" ya viene con Node

const { verificaTokenImg } = require('../middlewares/autenticacion'); // Importar Middleware "verificaTokenImg" para comprobar que exista un token válido antes de mostrar la imagen

app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo; // Almacena el tipo (en este caso "usuarios" o "productos") que viene como una query a través de la url
    let img = req.params.img; // Almacena la imagen "img" o archivo que viene como una query a través de la url

    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`); // Almacena la ruta o path en el servidor con el tipo y nombre de la imagen que quiero comprobar más abajo si existe

    let pathNoImg = path.resolve(__dirname, '../assets/no-image.jpg'); // Almacena la ruta o path con la imagen en el servidor (en este caso "no-image.jpg" la iamgen a mostrar si no se encuentra una imagen de un producto o un usuario). El "__dirname" hace referencia o apunta al directorio donde se encuentra el archivo en cuestión (en este caso al directorio "routes/imagenes.js")


    if (fs.existsSync(pathImg)) { // Si existe la ruta con la imagen en cuestión:
        return res.sendFile(pathImg); // Retorna el archivo o la imagen
    } else { // Si no exite
        return res.sendFile(pathNoImg); // Retorna la imagen "no-image.jpg"
    }



});



module.exports = app;