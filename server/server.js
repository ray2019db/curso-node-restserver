require('./config/config'); // Importa el contenido este arcivo './config/config' al inicio de la aplicación que contiene las variables globales y de entorno que serán empleadas por la aplicación

const express = require('express');
const app = express();

// const bodyParser = require('body-parser'); // Importa el paquete 'body-parser' para poder usarlo como middleware y poder obtener en el objeto 'req.body' el cuerpo de las peticiones (propiedades y sus valores). Esta forma está deprecada ahora viene dentro del express y se emplea el middleware como se muestra más abajo

// =========================================================================================
// Body Parser Middlewares para obtener el 'req.body'. Sin estos middlewares no se podría obtener el cuerpo de las peticiones http (req.body)
// =========================================================================================
app.use(express.urlencoded({ extended: false })); // Para parsear el tipo de body 'application/x-www-form-urlencoded'. Ahora se usa así y no como antes 'app.use(bodyParser.urlencoded({ extended: false }))' ya que quedo deprecado
app.use(express.json()); // Para parsear el tipo de body 'application/json'. Ahora se usa así y no como antes 'app.use(bodyParser.json())' ya que quedo deprecado

app.get('/usuario', (req, res) => {
    res.json('GET de usuario'); // Envía la respuesta en formato JSON 'json()'
});

app.post('/usuario', (req, res) => {
    let body = req.body;

    if (body.nombre === undefined) { // Si la propiedad nombre (req.body.nombre) no viene en el cuerpo de la petición o payload (req.body) haz lo sgte
        res.status(400).json({ // Envia un código de estado 'status()' y un mensaje en formato JSON '.json()'
            ok: false,
            mensaje: 'El nombre es necesario'
        });
    } else { // Si el nombre viene en el cuerpo de la petición haz lo sgte
        res.json({ // Envía está respuesta en formato JSON 'json()'
            usuario: body
        });
    }
});

app.put('/usuario', (req, res) => {
    res.json('PUT de usuario');
});

app.delete('/usuario', (req, res) => {
    res.json('DELETE de usuario');
});

app.put('/usuario/:id_usuario', (req, res) => {
    let id = req.params.id_usuario
    res.json({
        id
    });
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando peticiones por el puerto: ', process.env.PORT);
});