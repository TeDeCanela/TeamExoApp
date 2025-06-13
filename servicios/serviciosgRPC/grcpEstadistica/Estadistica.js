// servicios/serviciosgRPC/Estadisticas.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { obtenerEstadisticas } = require('./controladores/EstadisticaGRPC');

let grpcServer;

function createGrpcServer() {
    const PROTO_PATH = path.join(__dirname, './estadistica.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
    const grpcObject = grpc.loadPackageDefinition(packageDefinition);
    const proto = grpcObject.estadistica;

    grpcServer = new grpc.Server();
    grpcServer.addService(proto.EstadisticasService.service, {
        ObtenerEstadisticas: obtenerEstadisticas
    });

    return { proto };
}

async function startGrpcServer() {
    createGrpcServer();
    return new Promise((resolve, reject) => {
        grpcServer.bindAsync('0.0.0.0:3000', grpc.ServerCredentials.createInsecure(), (err, port) => {
            if (err) return reject(err);
            grpcServer.start();
            console.log(`Servidor gRPC Notificacion corriendo en puerto ${port}`);
            resolve();
        });
    });
}

function stopGrpcServer() {
    if (grpcServer) grpcServer.forceShutdown();
}

module.exports = {
    startGrpcServer,
    stopGrpcServer
};