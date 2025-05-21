process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test' });
const { MONGO_URI } = require('../../src/config');

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Usuario = require('../../src/modelos/Usuario');

describe('DELETE /api/usuarios/:usuarioId - Eliminar Usuario', () => {
    beforeAll(async () => {
        console.log('MONGO_URI que se usará:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
    });

    afterAll(async () => {
        await Usuario.deleteMany({});
        await mongoose.connection.close();
    });

    test('Debe eliminar al usuario correctamente', async () => {
        const usuario = await Usuario.create({
            nombreUsuario: 'nicoeliminar',
            nombre: 'Nicole',
            apellidos: 'Oh',
            correo: 'delete@correo.com',
            contrasena: '123',
            rol: 'Fan'
        });

        const res = await request(app)
            .delete(`/api/usuarios/${usuario.usuarioId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toMatch(/ha sido eliminado/i);
        expect(res.body.usuario.correo).toBe('delete@correo.com');

        const encontrado = await Usuario.findOne({ usuarioId: usuario.usuarioId });
        expect(encontrado).toBeNull(); // ya no debería existir
    });

    test('Debe retornar 404 si el usuario no existe', async () => {
        const res = await request(app)
            .delete('/api/usuarios/9999');

        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe('Usuario no encontrado');
    });

    test('Debe retornar 400 si no se proporciona usuarioId', async () => {
        const res = await request(app).delete('/api/usuarios/');
        expect(res.statusCode).toBe(404);
    });
});
