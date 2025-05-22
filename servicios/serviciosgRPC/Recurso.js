const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const mongoose = require('mongoose');
const { crearRecurso } = require('../../src/controladores/grpc/RecursoGRPC');
const { MONGO_URI } = require('../../src/config');

let grpcServer;

function createGrpcServer() {
    const PROTO_PATH = path.join(__dirname, '../protos/recurso.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
    const grpcObject = grpc.loadPackageDefinition(packageDefinition);
    const proto = grpcObject.recurso;

    grpcServer = new grpc.Server({
        'grpc.max_send_message_length': 50 * 1024 * 1024,
        'grpc.max_receive_message_length': 50 * 1024 * 1024
    });

    grpcServer.addService(proto.RecursoService.service, {
        CrearRecurso: crearRecurso
    });

    return { proto };
}

async function startGrpcServer() {
    await mongoose.connect(MONGO_URI);
    createGrpcServer();

    return new Promise((resolve, reject) => {
        grpcServer.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
            if (err) return reject(err);
            grpcServer.start();
            console.log(`Servidor gRPC de Recurso corriendo en puerto ${port}`);
            resolve();
        });
    });
}

function stopGrpcServer() {
    if (grpcServer) grpcServer.forceShutdown();
}

module.exports = { startGrpcServer, stopGrpcServer };
