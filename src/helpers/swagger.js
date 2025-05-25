const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API Principal',
        version: '1.0.0',
        description: 'Documentación de la API para usuarios, publicaciones, recursos, notificaciones, comentarios, reacciones y estadísticas.',
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Servidor de desarrollo',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
};

const path = require('path'); // <--- asegúrate de tener esto importado

const options = {
    swaggerDefinition,
    apis: [path.join(__dirname, '../../servicios/rutasREST/*.js')],
};


const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
