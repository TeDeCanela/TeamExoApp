const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Comentario = require('../../src/modelos/Comentario');

describe('DELETE /api/comentarios/:comentarioId - Eliminar comentario', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await Comentario.deleteMany();

        await Comentario.create({
            comentarioId: 4001,
            publicacionId: 2,
            usuarioId: 20,
            texto: 'Comentario a eliminar'
        });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debe eliminar el comentario correctamente', async () => {
        const res = await request(app).delete('/api/comentarios/4001');

        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toBe('Comentario eliminado correctamente');
        expect(res.body.comentario.comentarioId).toBe(4001);
    });

    test('Debe devolver 404 si el comentario no existe', async () => {
        const res = await request(app).delete('/api/comentarios/9999');

        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe('Comentario no encontrado');
    });

    test('Debe manejar errores al eliminar el comentario', async () => {
        jest.spyOn(Comentario, 'findOneAndDelete').mockImplementation(() => {
            throw new Error('Error simulado al eliminar');
        });

        const res = await request(app)
            .delete('/api/comentarios/500');

        expect(res.statusCode).toBe(500);
        expect(res.body.msg).toBe('Error del servidor');

        Comentario.findOneAndDelete.mockRestore();
    });

    test('Debe retornar 404 si no se encuentra el comentario a eliminar', async () => {
        jest.spyOn(Comentario, 'findOneAndDelete').mockResolvedValue(null);

        const res = await request(app)
            .delete('/api/comentarios/999');

        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe('Comentario no encontrado');

        Comentario.findOneAndDelete.mockRestore();
    });


});
