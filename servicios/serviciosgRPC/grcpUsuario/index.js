const { startGrpcServer } = require('./Usuario');

// Lanza el servidor gRPC al ejecutar este archivo
startGrpcServer()
    .then(() => {
        console.log(' Servidor gRPC de Usuario iniciado correctamente');
    })
    .catch((err) => {
        console.error(' Error al iniciar el servidor gRPC:', err);
    });
