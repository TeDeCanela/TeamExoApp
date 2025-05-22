const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Reaccion = require('../../src/modelos/Reaccion');

process.env.NODE_ENV = 'test';

describe('GET /api/reacciones/publicacion/:id - Obtener reacciones de una publicación', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await Reaccion.deleteMany({});

        await Reaccion.insertMany([
            {
                reaccionId: 1,
                tipo: 'like',
                publicacionId: 101,
                usuarioId: 200
            },
            {
                reaccionId: 2,
                tipo: 'emoji',
                publicacionId: 101,
                usuarioId: 201
            },
            {
                reaccionId: 3,
                tipo: 'dislike',
                publicacionId: 102,
                usuarioId: 202
            }
        ]);
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debe devolver todas las reacciones de una publicación', async () => {
        const res = await request(app).get('/api/reacciones/publicacion/101');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
        expect(res.body[0].publicacionId).toBe(101);
    });

    test('Debe devolver un arreglo vacío si no hay reacciones para esa publicación', async () => {
        const res = await request(app).get('/api/reacciones/publicacion/999');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(0);
    });
});
