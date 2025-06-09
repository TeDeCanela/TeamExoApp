const { startGrpcServer } = require('./Estadistica');

// Lanza el servidor gRPC al ejecutar este archivo
startGrpcServer()
    .then(() => {
        console.log(' Servidor gRPC de Estadistica iniciado correctamente');
    })
    .catch((err) => {
        console.error(' Error al iniciar el servidor gRPC:', err);
    });
