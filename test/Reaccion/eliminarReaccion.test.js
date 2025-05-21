const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Reaccion = require('../../src/modelos/Reaccion');

process.env.NODE_ENV = 'test';

describe('DELETE /api/reacciones/:reaccionId - Eliminar una reacción', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await Reaccion.deleteMany({});

        await Reaccion.create({
            reaccionId: 800,
            tipo: 'dislike',
            publicacionId: 200,
            usuarioId: 201
        });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debe eliminar la reacción correctamente', async () => {
        const res = await request(app).delete('/api/reacciones/800');

        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toBe('Reacción eliminada correctamente');
        expect(res.body.reaccion.reaccionId).toBe(800);

        const eliminada = await Reaccion.findOne({ reaccionId: 800 });
        expect(eliminada).toBeNull();
    });

    test('Debe devolver 404 si la reacción no existe', async () => {
        const res = await request(app).delete('/api/reacciones/9999');

        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe('Reacción no encontrada');
    });
});
