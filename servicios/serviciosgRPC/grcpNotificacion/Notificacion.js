const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { streamNotificaciones } = require('./controladores/NotificacionGRPC');

let grpcServer;

function createGrpcServer() {
    const PROTO_PATH = path.join(__dirname, './notificacion.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
    const grpcObject = grpc.loadPackageDefinition(packageDefinition);
    const proto = grpcObject.notificacion;

    grpcServer = new grpc.Server();
    grpcServer.addService(proto.NotificacionService.service, {
        StreamNotificaciones: streamNotificaciones
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