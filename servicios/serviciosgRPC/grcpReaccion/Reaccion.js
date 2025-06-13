const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const mongoose   = require('mongoose');
const { MONGO_URI } = require('./config');
const { Reaccion } = require('../../../src/modelos/Reaccion');

let grpcServer;
const suscriptores = {};

function createGrpcServer() {
    const PROTO_PATH = path.join(__dirname, './reaccion.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
    const grpcObject = grpc.loadPackageDefinition(packageDefinition);
    const proto = grpcObject.reaccion;

    grpcServer = new grpc.Server();
    grpcServer.addService(proto.ReaccionService.service, {
        StreamReacciones: streamReacciones
    });

    return { proto };
}

function streamReacciones(call) {
    const { publicacionId } = call.request;

    if (!publicacionId) {
        call.end();
        return;
    }

    if (!suscriptores[publicacionId]) {
        suscriptores[publicacionId] = [];
    }

    suscriptores[publicacionId].push(call);
    call.on('cancelled', () => {
        suscriptores[publicacionId] = suscriptores[publicacionId].filter(s => s !== call);
    });
}

async function startGrpcServer() {
    await mongoose.connect(MONGO_URI);
    createGrpcServer();

    return new Promise((resolve, reject) => {
        grpcServer.bindAsync('0.0.0.0:3000', grpc.ServerCredentials.createInsecure(), (err, port) => {
            if (err) return reject(err);
            grpcServer.start();
            console.log(`Servidor gRPC Reaccion corriendo en puerto ${port}`);
            resolve();
        });
    });
}

function stopGrpcServer() {
    if (grpcServer) grpcServer.forceShutdown();
}

module.exports = {
    startGrpcServer,
    stopGrpcServer,
};
