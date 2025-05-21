const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Comentario = require('../../src/modelos/Comentario');

describe('PUT /api/comentarios/:comentarioId - Actualizar comentario', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await Comentario.deleteMany({});

        await Comentario.create({
            comentarioId: 3001,
            publicacionId: 1,
            usuarioId: 10,
            texto: 'Comentario original'
        });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debe actualizar el texto del comentario', async () => {
        const res = await request(app)
            .put('/api/comentarios/3001')
            .send({ texto: 'Comentario actualizado' });

        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toBe('Comentario actualizado');
        expect(res.body.comentario.texto).toBe('Comentario actualizado');
    });

    test('Debe devolver 404 si el comentario no existe', async () => {
        const res = await request(app)
            .put('/api/comentarios/9999')
            .send({ texto: 'Texto' });

        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe('Comentario no encontrado');
    });

    test('Debe manejar errores al actualizar el comentario', async () => {
        jest.spyOn(Comentario, 'findOneAndUpdate').mockImplementation(() => {
            throw new Error('Error simulado al actualizar');
        });

        const res = await request(app)
            .put('/api/comentarios/500')
            .send({ texto: 'Comentario actualizado' });

        expect(res.statusCode).toBe(500);
        expect(res.body.msg).toBe('Error del servidor');

        Comentario.findOneAndUpdate.mockRestore();
    });

    test('Debe retornar 404 si no se encuentra el comentario a actualizar', async () => {
        jest.spyOn(Comentario, 'findOneAndUpdate').mockResolvedValue(null);

        const res = await request(app)
            .put('/api/comentarios/999')
            .send({ texto: 'Nuevo texto' });

        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe('Comentario no encontrado');

        Comentario.findOneAndUpdate.mockRestore();
    });

});
