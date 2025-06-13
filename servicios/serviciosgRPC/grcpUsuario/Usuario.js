const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const mongoose = require('mongoose');
const { login, perfil } = require('./controladores/UsuarioGRPC');
const { MONGO_URI } = require('./config');

let grpcServer;

function createGrpcServer() {
    const PROTO_PATH = path.join(__dirname, './usuario.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
    const grpcObject = grpc.loadPackageDefinition(packageDefinition);
    const proto = grpcObject.usuario;
    grpcServer = new grpc.Server();
    grpcServer.addService(proto.UsuarioService.service, {
        Login: login,
        Perfil: perfil
    });

    return { proto };
}

async function startGrpcServer() {
    await mongoose.connect(MONGO_URI);

    createGrpcServer();

    return new Promise((resolve, reject) => {
        grpcServer.bindAsync('0.0.0.0:3000', grpc.ServerCredentials.createInsecure(), (err, port) => {
            if (err) return reject(err);
            grpcServer.start();
            resolve();
        });
    });
}

function stopGrpcServer() {
    if (grpcServer) grpcServer.forceShutdown();
}

module.exports = { startGrpcServer, stopGrpcServer };
