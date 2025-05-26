const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de ExoAPP',
            version: '1.0.0',
            description: 'Documentación de la API para usuarios, recursos, reacciones,estadisticas,notificaciones,' +
                ' , publicaciones y comentarios.',
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
            },
        ],
    },
    apis: ['./servicios/rutasREST/*.js', './src/controladores/**/*.js', "./servicios/protos/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };
