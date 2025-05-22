const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/app");
const Usuario = require('../../src/modelos/Usuario');
process.env.NODE_ENV = 'test';


describe("POST /api/usuarios - Actualizar Usuario", () => {

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });
    test('Debe devolver 404 si el usuario no existe', async () => {
        const usuarioId = 9999;

        const res = await request(app)
            .put(`/api/usuarios/${usuarioId}`)
            .send({
                nombreUsuario: 'nicotest',
                nombre: 'Nicole',
                apellidos: 'Oh',
                correo: 'nicole@email.com',
                contrasena: '123456',
                rol: 'Fan'
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe('Usuario no encontrado');
    });

    test('Debe actualizar al usuario correctamente', async () => {
        // Paso 1: Crear usuario (sin usuarioId manual)
        const nuevoUsuario = await Usuario.create({
            nombreUsuario: 'original',
            nombre: 'Original',
            apellidos: 'Apellido',
            correo: 'original@email.com',
            contrasena: 'abc123',
            rol: 'Fan'
        });

        const id = nuevoUsuario.usuarioId;

        const res = await request(app)
            .put(`/api/usuarios/${id}`)
            .send({
                nombreUsuario: 'actualizado',
                nombre: 'Nicole',
                apellidos: 'Oh',
                correo: 'nuevo@email.com',
                contrasena: '123456',
                rol: 'Moderador'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.usuario).toBeDefined();
        expect(res.body.usuario.correo).toBe('nuevo@email.com');
        expect(res.body.usuario.nombreUsuario).toBe('actualizado');
    });

    test('Debe rechazar si el correo ya está registrado por otro usuario', async () => {
        await new Usuario({
            usuarioId: 200,
            nombreUsuario: 'userA',
            nombre: 'Usuario A',
            apellidos: 'Uno',
            correo: 'correo@repetido.com',
            contrasena: '123',
            rol: 'Fan'
        }).save();

        await new Usuario({
            usuarioId: 201,
            nombreUsuario: 'userB',
            nombre: 'Usuario B',
            apellidos: 'Dos',
            correo: 'otra@email.com',
            contrasena: '456',
            rol: 'Fan'
        }).save();

        const res = await request(app)
            .put(`/api/usuarios/201`)
            .send({
                nombreUsuario: 'userB',
                nombre: 'Usuario B',
                apellidos: 'Dos',
                correo: 'correo@repetido.com',
                contrasena: '456',
                rol: 'Moderador'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.msg).toMatch(/ya está registrado/i);
    });
});

