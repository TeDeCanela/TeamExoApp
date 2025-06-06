const request = require("supertest");
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const app = require("../../src/app");
const Usuario = require('../../src/modelos/Usuario');
process.env.NODE_ENV = 'test';


describe("POST /api/usuarios - Actualizar Contraseña", () => {
    jest.setTimeout(15000);
    beforeAll(async () => {
        try {
            console.log('Intentando conectar a MongoDB:', process.env.MONGO_URI);
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/teamexodb_test');
            console.log('Conexión exitosa');
        } catch (err) {
            console.error('Error al conectar a MongoDB:', err);
            throw err;
        }
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debe actualizar la contraseña correctamente', async () => {
        const usuario = await Usuario.create({
            usuarioId: 1000,
            nombreUsuario: 'prueba',
            nombre: 'Nicole',
            apellidos: 'Test',
            correo: 'correo@clave.com',
            contrasena: 'anterior',
            rol: 'Fan'
        });

        const res = await request(app)
            .put(`/api/usuarios/${usuario.usuarioId}/contrasena`)
            .send({
                nuevaContrasena: 'nueva123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toMatch(/contraseña actualizada/i);

        const usuarioActualizado = await Usuario.findOne({ usuarioId: usuario.usuarioId });
        expect(usuarioActualizado).toBeDefined();
        expect(usuarioActualizado.contrasena).not.toBe('nueva123');

        const coincide = await bcrypt.compare('nueva123', usuarioActualizado.contrasena);
        expect(coincide).toBe(true);
    });

    test('Debe responder 404 si el usuario no existe', async () => {
        const res = await request(app)
            .put('/api/usuarios/9999/contrasena')
            .send({ nuevaContrasena: 'clave' });

        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe('Usuario no encontrado');
    });

    test('Debe rechazar si la nueva contraseña está vacía', async () => {
        const usuario = await Usuario.create({
            nombreUsuario: 'testvacio',
            nombre: 'Vacio',
            apellidos: 'Ap',
            correo: 'vacio@email.com',
            contrasena: 'temp',
            rol: 'Fan'
        });

        const res = await request(app)
            .put(`/api/usuarios/${usuario.usuarioId}/contrasena`)
            .send({ nuevaContrasena: '' });

        expect(res.statusCode).toBe(400);
        expect(res.body.msg).toMatch(/no puede estar vacía/i);
    });

});

