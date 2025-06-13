const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const mongoose = require('mongoose');
const { MONGO_URI } = require('../../../src/config');
const { obtenerEstadisticas } = require('./controladores/EstadisticaGRPC');

let grpcServer;

async function conectarBD() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    } catch (error) {
        throw error;
    }
}

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
    await conectarBD();

    createGrpcServer();

    return new Promise((resolve, reject) => {
        grpcServer.bindAsync('0.0.0.0:3000', grpc.ServerCredentials.createInsecure(), (err, port) => {
            if (err) return reject(err);
            grpcServer.start();
            console.log(` Servidor gRPC Estadistica corriendo en puerto ${port}`);
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
