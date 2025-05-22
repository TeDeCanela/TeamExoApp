const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Reaccion = require('../../src/modelos/Reaccion');

process.env.NODE_ENV = 'test';

describe('PUT /api/reacciones/:reaccionId - Actualizar tipo de reacción', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await Reaccion.deleteMany({});

        await Reaccion.create({
            reaccionId: 500,
            tipo: 'like',
            publicacionId: 101,
            usuarioId: 200
        });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debería actualizar el tipo de reacción correctamente', async () => {
        const res = await request(app)
            .put('/api/reacciones/500')
            .send({ tipo: 'emoji' });

        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toBe('Reacción actualizada');
        expect(res.body.reaccion.reaccionId).toBe(500);
        expect(res.body.reaccion.tipo).toBe('emoji');

        const enDB = await Reaccion.findOne({ reaccionId: 500 });
        expect(enDB.tipo).toBe('emoji');
    });

    test('Debe devolver 404 si la reacción no existe', async () => {
        const res = await request(app)
            .put('/api/reacciones/9999')
            .send({ tipo: 'dislike' });

        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe('Reacción no encontrada');
    });
});
