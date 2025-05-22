const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Notificacion = require('../../src/modelos/Notificacion');

describe('DELETE /api/notificaciones/:id', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Notificacion.deleteMany({});
    });

    test('Elimina una notificación existente', async () => {
        await Notificacion.create({
            notificacionId: 301,
            usuarioId: 2,
            tipo: 'seguimiento',
            mensaje: 'Te han seguido'
        });

        const res = await request(app).delete('/api/notificaciones/301');

        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toBe('Notificación eliminada correctamente');
    });

    test('Retorna 404 si no encuentra la notificación', async () => {
        const res = await request(app).delete('/api/notificaciones/999');
        expect(res.statusCode).toBe(404);
    });
});
