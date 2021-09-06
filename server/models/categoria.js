const mongoose = require('mongoose'); // Importar la librería de mongoose

let Schema = mongoose.Schema; // Crear el cascarón de un esquema para después poder crear esquemas de mongoose


let categoriaSchema = new Schema({ // Define el esquema de Categoria (aquí se definen los campos que tendrá mi colección (tabla) de categorias en la DB (cafe) y sus validaciones). La colección toma el nombre del esquema pero en plural, en este caso 'categorias'
    descripcion: {
        type: String, //  Defino que el nombre será de tipo 'String'
        required: [true, 'La descripción de la categoria es requerida'] // Defino que el nombre será requerido (true) y también defino el mensaje a mostrar en caso que no se cumpla la condición. Estas validaciones se almacenan en un arreglo
    },
    usuario: {
        type: Schema.Types.ObjectId, // Define que el campo "usuario" será de tipo "Schema.Types.ObjectId" o sea que almacenará en este campo el "ObjectId" en otras palabras el "_id" del usuario que está autenticado en la aplicación a la hora de crear una nueva categoría
        ref: 'Usuario' // Este campo hace referncia a la colección de usuarios "esquema o modelo de Usuario" de la DB
    }
});

// ===============================================================================================================================
//  EXPORTAR EL MODELO O ESQUEMA DE CATEGORIA
// ===============================================================================================================================
module.exports = mongoose.model('Categoria', categoriaSchema); // Exportar el modelo de 'Categoria' para emplearlo en la aplicación. No es más que el esquema de categoria (categoriaSchema) que se nombra con un alias para identificarlo mejor, en este caso 'Categoria'