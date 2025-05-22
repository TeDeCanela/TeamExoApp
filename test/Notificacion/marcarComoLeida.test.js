const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Notificacion = require('../../src/modelos/Notificacion');

describe('PATCH /api/notificaciones/:id/marcar', () => {
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

    test('Marca una notificación como leída', async () => {
        await Notificacion.create({
            notificacionId: 101,
            usuarioId: 1,
            tipo: 'comentario',
            mensaje: 'Prueba de lectura',
            leida: false
        });

        const res = await request(app).patch('/api/notificaciones/101/marcar-leida');

        expect(res.statusCode).toBe(200);
        expect(res.body.leida).toBe(true);
    });

    test('Retorna 404 si la notificación no existe', async () => {
        const res = await request(app).patch('/api/notificaciones/999/marcar-leida');
        expect(res.statusCode).toBe(404);
    });
});
