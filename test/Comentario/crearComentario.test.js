const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Comentario = require('../../src/modelos/Comentario');

process.env.NODE_ENV = 'test';

describe('POST /api/comentarios - Crear Comentario', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await Comentario.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debería crear un nuevo comentario correctamente', async () => {
        const nuevoComentario = {
            comentarioId: 500,
            publicacionId: 1,
            usuarioId: 42,
            texto: '¡Qué buena canción!'
        };

        const res = await request(app)
            .post('/api/comentarios')
            .send(nuevoComentario);

        expect(res.statusCode).toBe(201);
        expect(res.body.comentario).toBeDefined();
        expect(res.body.comentario.texto).toBe('¡Qué buena canción!');
    });

    test('Debería fallar si falta el campo texto', async () => {
        const comentarioInvalido = {
            comentarioId: 501,
            publicacionId: 1,
            usuarioId: 42
        };

        const res = await request(app)
            .post('/api/comentarios')
            .send(comentarioInvalido);

        expect(res.statusCode).toBe(500);
        expect(res.body.msg).toMatch(/Error del servidor/i);
    });

    test('Debería manejar errores al obtener comentarios', async () => {
        jest.spyOn(Comentario, 'find').mockImplementation(() => {
            throw new Error('Fallo simulado');
        });

        const res = await request(app).get('/api/comentarios/publicacion/1');

        expect(res.statusCode).toBe(500);
        expect(res.body.msg).toBe('Error del servidor');

        Comentario.find.mockRestore();
    });
});
