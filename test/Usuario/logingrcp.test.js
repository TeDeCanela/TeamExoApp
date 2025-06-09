    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const { startGrpcServer, stopGrpcServer } = require('../../servicios/serviciosgRPC/grcpUsuario/Usuario');
    const grpc = require('@grpc/grpc-js');
    const protoLoader = require('@grpc/proto-loader');
    const path = require('path');
    const mongoose = require('mongoose');
    const Usuario = require('../../src/modelos/Usuario');
    const bcrypt = require('bcrypt');

    const PROTO_PATH = path.join(__dirname, '../../servicios/serviciosgRPC/grcpUsuario/usuario.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
    const grpcObject = grpc.loadPackageDefinition(packageDefinition);
    const proto = grpcObject.usuario;

    let client;

    beforeAll(async () => {
        await startGrpcServer();
        await new Promise(res => setTimeout(res, 500));

        await Usuario.deleteMany({});

        const hashed = await bcrypt.hash('clave123', 10);
        await Usuario.create({
            usuarioId: 2,
            nombreUsuario: 'nicotest',
            nombre: 'Nicole',
            apellidos: 'Oh',
            correo: 'nico@correo.com',
            contrasena: hashed,
            rol: 'Fan'
        });

        client = new proto.UsuarioService('localhost:3000', grpc.credentials.createInsecure());

        // Espera a que esté listo el cliente
        await new Promise((resolve, reject) => {
            client.waitForReady(Date.now() + 3000, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });

    afterAll(async () => {
        await Usuario.deleteMany({});
        await mongoose.connection.close();
        stopGrpcServer();
    });

    test('Login exitoso con credenciales correctas', (done) => {
        client.Login({ correo: 'nico@correo.com', contrasena: 'clave123' }, (err, response) => {
            try {
                expect(err).toBeNull();
                expect(response.exito).toBe(true);
                expect(response.nombreUsuario).toBe('nicotest');
                expect(response.token).toBeDefined();
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    test('Login falla con correo incorrecto', (done) => {
        client.Login({ correo: 'correo_invalido@correo.com', contrasena: 'clave123' }, (err, response) => {
            try {
                expect(err).toBeNull();
                expect(response.exito).toBe(false);
                expect(response.mensaje).toBe('Correo no encontrado');
                expect(response.token).toBe('');
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    test('Login falla con contraseña incorrecta', (done) => {
        client.Login({ correo: 'nico@correo.com', contrasena: 'claveIncorrecta' }, (err, response) => {
            try {
                expect(err).toBeNull();
                expect(response.exito).toBe(false);
                expect(response.mensaje).toBe('Contraseña incorrecta');
                expect(response.token).toBe('');
                done();
            } catch (e) {
                done(e);
            }
        });
    });
