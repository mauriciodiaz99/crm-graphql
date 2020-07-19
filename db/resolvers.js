const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

const crearToken = (usuario, secreta, expiresIn) => {
    console.log(usuario);
    const { id, email, nombre, apellido } = usuario;
    return jwt.sign( { id, email, nombre, apellido }, secreta, { expiresIn } )
}

//Resolvers
const resolvers = {
    Query: {
        obtenerUsuario: async (_, { token }) => {
            const usuarioId = await jwt.verify(token, process.env.SECRETA)
            return usuarioId;
        },
        obtenerProductos: async () => {
            try {
                const productos = await Producto.find({});
                return productos;
            } catch (error) {
                console.log(error)
            }
        },
        obtenerProducto: async (_, { id }) => {
            // revisar si elproducto existe o no
            const producto = await Producto.findById(id);

            if(!producto) {
                throw new Error('Producto no Encontrado!');
            }

            return producto;
        }
    },
    Mutation: {
        nuevoUsuario: async (_, {input}) => {
            
            const { email, password } = input;

            // Revisar si el usuario no esta registrado
            const existeUsuario = await Usuario.findOne({email});
            if (existeUsuario) {
                throw new Error('El usuario ya esta registrado!');
            }

            //Hashear su password
            // const salt = await bcryptjs.getSalt(10);
            const salt = await bcryptjs.genSaltSync(10);
            input.password = await bcryptjs.hash(password, salt);
             
            // const sc = simplecrypt();
 
            // input.password = await sc.encrypt(password);
            

            try {
                //Guardar en la base de datos
                const usuario = new Usuario(input);
                usuario.save(); //Guardarlo
                return usuario;
            } catch (error) {
                console.log(error);
            }
        },
        autenticarUsuario: async (_, {input}) => {

            const { email, password } = input;
            
            //Si el usuario Existe
            const existeUsuario = await Usuario.findOne({email});
            if (!existeUsuario) {
                throw new Error('El usuario no Existe!');
            }
            // const sc = simplecrypt();
            //Revisar si el password es el correcto
            // const passwordCorrecto = await sc.salt();
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);
            if (!passwordCorrecto) {
                throw new Error('El Password es Incorrecto!');
            }

            //Crear el Token
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '24h')
            }
        },
        nuevoProducto: async (_, { input }) => {
            try {
                const producto = new Producto(input);

                //Almacenar en la BD
                const resultado = await producto.save();
                return resultado;
            } catch (error) {
                console.log(error)
            }
        },
        actualizarProducto: async (_, {id, input}) => {
            // revisar si elproducto existe o no
            let producto = await Producto.findById(id);

            if(!producto) {
                throw new Error('Producto no Encontrado!');
            }

            //Guardar en la DB
            producto = await Producto.findOneAndUpdate({ _id: id }, input, { new: true });

            return producto;
        },
        eliminarProducto: async(_, {id}) => {
            // revisar si elproducto existe o no
            let producto = await Producto.findById(id);

            if(!producto) {
                throw new Error('Producto no Encontrado!');
            }

            //Eliminar
            await Producto.findOneAndDelete({_id:id});

            return "Producto Eliminado";
        },
        nuevoCliente: async(_, { input }) => {
            //Verificar si el cliente esta registrado
            console.log(input);

            //Asignar el vendedor

            //Guardarlo en la DB
        }
    }
}

module.exports = resolvers;