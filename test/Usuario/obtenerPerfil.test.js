const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const Usuario = require('../../src/modelos/Usuario');
const { JWT_SECRET } = require('../../src/config');

describe('GET /api/usuarios/perfil', () => {
    let token;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/teamexodb_test');
        await Usuario.deleteMany({});

        const hashed = await bcrypt.hash('clave123', 10);

        const usuario = await Usuario.create({
            usuarioId: 99,
            nombreUsuario: 'testuser',
            nombre: 'Test',
            apellidos: 'User',
            correo: 'test@correo.com',
            contrasena: hashed,
            rol: 'Fan'
        });

        token = jwt.sign(
            { id: usuario.usuarioId, correo: usuario.correo, rol: usuario.rol },
            JWT_SECRET || 'secreto',
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        await Usuario.deleteMany({});
        await mongoose.connection.close();
    });

    test('debe devolver el perfil del usuario autenticado', async () => {
        const res = await request(app)
            .get('/api/usuarios/perfil')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.usuario).toBeDefined();
        expect(res.body.usuario.nombreUsuario).toBe('testuser');
        expect(res.body.usuario.correo).toBe('test@correo.com');
        expect(res.body.usuario.contrasena).toBeUndefined(); // No debe incluirse
    });

    test('debe fallar si no se envía token', async () => {
        const res = await request(app)
            .get('/api/usuarios/perfil');

        expect(res.statusCode).toBe(401);
        expect(res.body.msg).toBe('No hay token en la petición');
    });

    test('debe fallar si el token es inválido', async () => {
        const res = await request(app)
            .get('/api/usuarios/perfil')
            .set('Authorization', `Bearer token_invalido`);

        expect(res.statusCode).toBe(401);
        expect(res.body.msg).toBe('Token inválido o expirado');
    });
});
