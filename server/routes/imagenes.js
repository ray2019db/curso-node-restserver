const express = require('express');

const path = require('path'); // Importar el path en Node "path" para poder trabajar con las rutas de los archivos guardados en el servidor (ruta o path absolutos) con el método "resolve()". No hay que hacer "npm" ya viene con Node

const fs = require('fs'); // Importar el File System en Node "fs" para poder trabajar con los archivos guardados en el servidor. No hay que hacer "npm" ya viene con Node

const { verificaTokenImg } = require('../middlewares/autenticacion');

app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`); // Almacena la ruta o path con el tipo y nombre de la imagen que quiero comprobar más abajo si existe

    let pathNoImg = path.resolve(__dirname, '../assets/no-image.jpg'); // El "__dirname" hace referencia o apunta al directorio donde se encuentra el archivo en cuestión (en este caso al directorio "routes/imagenes.js")


    if (fs.existsSync(pathImg)) {
        return res.sendFile(pathImg);
    } else {
        return res.sendFile(pathNoImg);
    }



});



module.exports = app;