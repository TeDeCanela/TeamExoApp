process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test' });

const { startGrpcServer, stopGrpcServer } = require('../../servicios/serviciosgRPC/Recurso');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const { Foto, Audio, Video } = require('../../src/modelos/Recurso');

const PROTO_PATH = path.join(__dirname, '../../servicios/protos/recurso.proto');
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

    client = new proto.RecursoService('localhost:50052', grpc.credentials.createInsecure());

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

describe('Pruebas de base de datos (Mongo)', () => {
    test('Crear recurso tipo Foto exitosamente', (done) => {
        const nuevaFoto = {
            tipo: 'Foto',
            identificador: 101,
            formato: 1,
            tamano: 2048,
            url: 'http://example.com/foto.jpg',
            usuarioId: 1,
            resolucion: 1080,
            archivo: Buffer.from('contenido de prueba', 'utf-8')
        };

        client.CrearRecurso(nuevaFoto, async (err, response) => {
            try {
                expect(err).toBeNull();
                expect(response.exito).toBe(true);

                const foto = await Foto.findOne({ identificador: 101 });
                expect(foto).not.toBeNull();
                expect(foto.URL).toBe('http://localhost:3000/uploads/recurso_101.jpg');
                expect(foto.resolucion).toBe(1080);

                done();
            } catch (e) {
                done(e);
            }
        });
    });

    test('Crear recurso tipo Audio exitosamente', (done) => {
        const nuevoAudio = {
            tipo: 'Audio',
            identificador: 202,
            formato: 2,
            tamano: 4096,
            url: 'http://example.com/audio.mp3',
            usuarioId: 3,
            duracion: 180,
            archivo: Buffer.from('contenido de prueba', 'utf-8')
        };

        client.CrearRecurso(nuevoAudio, async (err, response) => {
            try {
                expect(err).toBeNull();
                expect(response.exito).toBe(true);

                const audio = await Audio.findOne({ identificador: 202 });
                expect(audio).not.toBeNull();
                expect(audio.URL).toBe('http://localhost:3000/uploads/recurso_202.mp3');
                expect(audio.duracion).toBe(180);

                done();
            } catch (e) {
                done(e);
            }
        });
    });

    test('Crear recurso tipo Video exitosamente', (done) => {
        const nuevoVideo = {
            tipo: 'Video',
            identificador: 303,
            formato: 3,
            tamano: 8192,
            url: 'http://example.com/video.mp4',
            usuarioId: 4,
            resolucion: 1920,
            archivo: Buffer.from('contenido de prueba', 'utf-8')
        };

        client.CrearRecurso(nuevoVideo, async (err, response) => {
            try {
                expect(err).toBeNull();
                expect(response.exito).toBe(true);

                const video = await Video.findOne({ identificador: 303 });
                expect(video).not.toBeNull();
                expect(video.URL).toBe('http://localhost:3000/uploads/recurso_303.mp4');
                expect(video.resolucion).toBe(1920);

                done();
            } catch (e) {
                done(e);
            }
        });
    });

    test('Falla al crear recurso con tipo inválido', (done) => {
        const recursoInvalido = {
            tipo: 'Documento',
            identificador: 102,
            formato: 1,
            tamano: 500,
            url: 'http://example.com/file.docx',
            usuarioId: 2,
            archivo: Buffer.from('algo', 'utf-8')
        };

        client.CrearRecurso(recursoInvalido, (err, response) => {
            try {
                expect(err).toBeNull();
                expect(response.exito).toBe(false);
                expect(response.mensaje).toBe('Tipo de recurso no válido');
                done();
            } catch (e) {
                done(e);
            }
        });
    });
});
