const { startGrpcServer } = require('./Notificacion');

// Lanza el servidor gRPC al ejecutar este archivo
startGrpcServer()
    .then(() => {
        console.log(' Servidor gRPC de Notificacion iniciado correctamente');
    })
    .catch((err) => {
        console.error(' Error al iniciar el servidor gRPC:', err);
    });
