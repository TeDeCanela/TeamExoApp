const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Comentario = require('../../src/modelos/Comentario');

describe('GET /api/comentarios/publicacion/:id - Obtener comentarios por publicación', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await Comentario.deleteMany();

        await Comentario.insertMany([
            {
                comentarioId: 2001,
                publicacionId: 55,
                usuarioId: 101,
                texto: 'Comentario A'
            },
            {
                comentarioId: 2002,
                publicacionId: 55,
                usuarioId: 102,
                texto: 'Comentario B'
            },
            {
                comentarioId: 2003,
                publicacionId: 99,
                usuarioId: 103,
                texto: 'Comentario X'
            }
        ]);
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debe devolver los comentarios de la publicación 55', async () => {
        const res = await request(app).get('/api/comentarios/publicacion/55');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        res.body.forEach(c => expect(c.publicacionId).toBe(55));
    });

    test('Debe devolver vacío si la publicación no tiene comentarios', async () => {
        const res = await request(app).get('/api/comentarios/publicacion/123456');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(0);
    });
});
