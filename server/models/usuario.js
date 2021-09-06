const mongoose = require('mongoose'); // Importar la librería de mongoose

const uniqueValidator = require('mongoose-unique-validator'); // Importa el Pluging 'mongoose-unique-validator' para usarlo en los campos del esquema que requieran validación de tipo 'unique'. Permite validar el error 'unique' de manera más amigable

let Schema = mongoose.Schema; // Crear el cascarón de un esquema para después poder crear esquemas de mongoose

const rolesValidos = { // Almacena en un objeto las opciones de la propiedad "enum" del campo "role"
    values: ['USER_ROLE', 'ADMIN_ROLE'], // Contiene dentro de un arreglo los valores permitidos en la propiedad "enum" del campo al que se aplique
    message: '{VALUE} no es un rol permitido' // Mensaje que se mostrará al usuario cuando el campo contenga un valor diferente a los permitidos. El {VALUE} hará referencia al valor que no coincide con los permitidos insertado en el campo
};

// ===============================================================================================================================
//  MODELO O ESQUEMA DE USUARIO
// ===============================================================================================================================
let usuarioSchema = new Schema({ // Define el esquema de Usuario (aquí se definen los campos que tendrá mi colección (tabla) de usuarios en la DB (cafe) y sus validaciones). La colección toma el nombre del esquema pero en plural, en este caso 'usuarios'
    nombre: {
        type: String, //  Defino que el nombre será de tipo 'String'
        required: [true, 'El nombre es requerido'] // Defino que el nombre será requerido (true) y también defino el mensaje a mostrar en caso que no se cumpla la condición. Estas validaciones se almacenan en un arreglo
    },
    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true // Este campo (email) será único, no podrán existir dos usuarios en la colección de usuarios con el mismo email
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos // El validador "enum" (enumeración) enumera dentro de un arreglo en un objeto (rolesValidos) los valores permitidos para este campo (role) y un mensaje de error para mostrar al usuario cuando no se cumpla con esta condición
    },
    estado: {
        type: Boolean,
        default: true // Le coloca un valor por defecto a este campo (estado: true)
    },
    google: {
        type: Boolean,
        default: false
    }
});

// ===============================================================================================================================
//  EVITAR EL RETORNO DEL CAMPO PASSWORD EN EL MODELO DE MONGOOSE de esta manera nunca se retornará el campo "password" ni su valor o sea del lado del cliente no se sabrá ni como se llama el campo de la contraseña
// ===============================================================================================================================
usuarioSchema.methods.toJSON = function() { // Modificamos el método "toJSON()" (método que siempre es llamado cuando se intenta imprimir el esquema). En este caso lo modificaremos para cuando se llame la impresión del "usuarioSchema" y el Método "toJSON()" sea llamado nunca imprima (nunca retorne) el campo "password" del "usuarioSchema". Aquí no se puede usar una función de flecha ya que se trabaja con el objeto "this"
    let user = this; // Almacena el "this" (almacena el objeto del usuario en cuestión)
    let userObject = user.toObject(); // Obtengo todas las propiedades y métodos del usuario en cuestión
    delete userObject.password; // Elimina la contraseña (elimina el campo password del objeto del usuario en cuestión)
    return userObject; // Retorna el objeto del usuario en cuestión con el campo password eliminado
};

// ===============================================================================================================================
//  PLUGIN PARA UN MEJOR MANEJO DEL ERROR DE LA PROPIEDAD "UNIQUE" (campo único) EN EL CAMPO DEL MODELO DONDE SE APLIQUE
// ===============================================================================================================================
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' }); // Se aplica el plugin "uniqueValidator" al esquema "usuarioSchema" y se pasa como opciones en un objeto el mensaje que deseamos mostrar cuando no se cumpla la condición de "unique". El {PATH} hace referencia al nombre del campo que tiene aplicado el validador "unique" en este caso es "email"

// ===============================================================================================================================
//  EXPORTAR EL MODELO O ESQUEMA DE USUARIO
// ===============================================================================================================================
module.exports = mongoose.model('Usuario', usuarioSchema); // Exportar el modelo de 'Usuario' para emplearlo en la aplicación. No es más que el esquema de usuario (usuarioSchema) que se nombra con un alias para identificarlo mejor, en este caso 'Usuario'