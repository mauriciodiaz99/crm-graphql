const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const conectarDB = require('./config/db');


//Conectar a la base de Datos
conectarDB();

//Servidor
const server = new ApolloServer({
    typeDefs,
    resolvers
});

//Arrancar el servidor
server.listen().then( ({url}) => {
    console.log(`Servidor listo en la URL ${url}`)
});