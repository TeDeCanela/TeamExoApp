const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Reaccion = require('../../src/modelos/Reaccion');

process.env.NODE_ENV = 'test';

describe('POST /api/reacciones - Crear una reacción', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await Reaccion.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debería crear una nueva reacción correctamente', async () => {
        const nuevaReaccion = {
            reaccionId: 1,
            tipo: 'like',
            publicacionId: 101,
            usuarioId: 200
        };

        const res = await request(app)
            .post('/api/reacciones')
            .send(nuevaReaccion);

        expect(res.statusCode).toBe(201);
        expect(res.body.msg).toBe('Reacción creada');
        expect(res.body.reaccion).toMatchObject(nuevaReaccion);

        const enDB = await Reaccion.findOne({ reaccionId: 1 });
        expect(enDB).not.toBeNull();
        expect(enDB.tipo).toBe('like');
    });

    test('Debe fallar si falta un campo requerido', async () => {
        const res = await request(app)
            .post('/api/reacciones')
            .send({
                tipo: 'like',
                publicacionId: 101
            });

        expect(res.statusCode).toBe(500);
        expect(res.body.msg).toBe('Error del servidor');
    });

});
