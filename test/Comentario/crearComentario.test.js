const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Comentario = require('../../src/modelos/Comentario');

process.env.NODE_ENV = 'test';

describe('POST /api/comentarios - Crear Comentario', () => {
    let lastComentarioId = 0;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await Comentario.deleteMany({});

        // Encontrar el comentarioId más alto para generar nuevos IDs
        const lastComment = await Comentario.findOne().sort('-comentarioId');
        lastComentarioId = lastComment ? lastComment.comentarioId : 0;
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debería crear un nuevo comentario correctamente', async () => {
        const nuevoComentario = {
            publicacionId: 1,
            usuarioId: 42,
            texto: '¡Qué buena canción!'
        };

        const res = await request(app)
            .post('/api/comentarios')
            .send(nuevoComentario);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('msg', 'Comentario creado');

        // Verificación básica de campos requeridos
        expect(res.body.comentario).toEqual(
            expect.objectContaining({
                publicacionId: nuevoComentario.publicacionId,
                usuarioId: nuevoComentario.usuarioId,
                texto: nuevoComentario.texto,
                fecha: expect.any(String)
            })
        );

        // Verificación de campos adicionales
        expect(res.body.comentario).toHaveProperty('_id');
        expect(res.body.comentario).toHaveProperty('__v');
    });

    test('Debería fallar si falta el campo texto', async () => {
        const comentarioInvalido = {
            comentarioId: lastComentarioId + 2,
            publicacionId: 1,
            usuarioId: 42
        };

        const res = await request(app)
            .post('/api/comentarios')
            .send(comentarioInvalido);

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('msg', 'Error del servidor');
    });

    test('Debería fallar si el comentarioId no es único', async () => {
        // Primero creamos un comentario
        const primerComentario = {
            comentarioId: lastComentarioId + 3,
            publicacionId: 1,
            usuarioId: 42,
            texto: 'Primer comentario'
        };
        await request(app).post('/api/comentarios').send(primerComentario);

        // Intentamos crear otro con el mismo comentarioId
        const segundoComentario = {
            comentarioId: primerComentario.comentarioId, // Mismo ID
            publicacionId: 1,
            usuarioId: 42,
            texto: 'Segundo comentario'
        };

        const res = await request(app)
            .post('/api/comentarios')
            .send(segundoComentario);

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('msg', 'Error del servidor');
    });

    test('Debería fallar si falta publicacionId o usuarioId', async () => {
        const tests = [
            {
                name: 'Falta publicacionId',
                data: {
                    comentarioId: lastComentarioId + 4,
                    usuarioId: 42,
                    texto: 'Falta publicacionId'
                }
            },
            {
                name: 'Falta usuarioId',
                data: {
                    comentarioId: lastComentarioId + 5,
                    publicacionId: 1,
                    texto: 'Falta usuarioId'
                }
            }
        ];

        for (const test of tests) {
            const res = await request(app)
                .post('/api/comentarios')
                .send(test.data);

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('msg', 'Error del servidor');
        }
    });


});