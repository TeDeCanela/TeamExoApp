process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test' });

const { startGrpcServer, stopGrpcServer } = require('../../servicios/serviciosgRPC/grcpRecurso/Recurso');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const Recurso = require('../../src/modelos/Recurso');

const { Foto, Audio, Video } = require('../../src/modelos/Recurso');

const PROTO_PATH = path.join(__dirname, '../../servicios/serviciosgRPC/grcpRecurso/recurso.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const proto = grpcObject.recurso;

let client;

beforeAll(async () => {
    await startGrpcServer();
    await new Promise(res => setTimeout(res, 500));
    await Foto.deleteMany({});
    await Audio.deleteMany({});
    await Video.deleteMany({});

    client = new proto.RecursoService('localhost:3000', grpc.credentials.createInsecure(), {
        'grpc.max_send_message_length': 50 * 1024 * 1024,
        'grpc.max_receive_message_length': 50 * 1024 * 1024
    });

    await new Promise((resolve, reject) => {
        client.waitForReady(Date.now() + 3000, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
});

afterAll(async () => {
    await Foto.deleteMany({});
    await Audio.deleteMany({});
    await Video.deleteMany({});
    await mongoose.connection.close();
    stopGrpcServer();
});

describe('Descargar recurso', () => {
    const identificador = 2001;
    const tipo = 'Foto';
    const extension = 'jpg';
    const nombreArchivo = `recurso_${identificador}.${extension}`;
    const rutaGuardado = path.join(__dirname, '../../uploads', nombreArchivo);
    const rutaArchivoReal = path.join(__dirname, '../Assets/LaBillieElish.jpg');

    beforeAll(done => {
        const archivoBinario = fs.readFileSync(rutaArchivoReal);

        const recurso = {
            tipo,
            identificador,
            formato: 1,
            tamano: archivoBinario.length,
            url: `http://localhost:3000/uploads/${nombreArchivo}`,
            usuarioId: 1,
            resolucion: 1080,
            archivo: archivoBinario
        };

        client.CrearRecurso(recurso, (err, response) => {
            if (err || !response.exito) {
                return done(err || new Error(response.mensaje));
            }
            done();
        });
    });

    afterAll(() => {
        if (fs.existsSync(rutaGuardado)) {
            fs.unlinkSync(rutaGuardado);
        }
    });

    test('Debe descargar correctamente un recurso existente', (done) => {
        const request = { tipo, identificador };

        client.DescargarRecurso(request, (err, response) => {
            try {
                expect(err).toBeNull();
                expect(response.exito).toBe(true);
                expect(response.mensaje).toBe('Recurso descargado exitosamente');
                expect(response.archivo).toBeInstanceOf(Buffer);
                expect(response.archivo.length).toBeGreaterThan(0);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    test('Debe fallar al intentar descargar un recurso inexistente', (done) => {
        const request = { tipo: 'Foto', identificador: 9999 };

        client.DescargarRecurso(request, (err, response) => {
            try {
                expect(err).toBeNull();
                expect(response.exito).toBe(false);
                expect(response.mensaje).toBe('El recurso no existe');
                expect(Buffer.isBuffer(response.archivo)).toBe(true);
                expect(response.archivo.length).toBe(0);
                done();
            } catch (e) {
                done(e);
            }
        });
    });
});
