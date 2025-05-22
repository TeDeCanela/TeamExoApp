const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Notificacion = require('../../src/modelos/Notificacion');

describe('PATCH /api/notificaciones/marcar-leidas', () => {
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

    test('Marca múltiples notificaciones como leídas', async () => {
        const n1 = await Notificacion.create({
            notificacionId: 201,
            usuarioId: 1,
            tipo: 'reaccion',
            mensaje: 'Reacción 1'
        });

        const n2 = await Notificacion.create({
            notificacionId: 202,
            usuarioId: 1,
            tipo: 'comentario',
            mensaje: 'Comentario 2'
        });

        const res = await request(app)
            .patch('/api/notificaciones/marcar-leidas')
            .send({ ids: [n1._id, n2._id] });

        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toContain('2 notificaciones marcadas como leídas');

        const revisadas = await Notificacion.find({ _id: { $in: [n1._id, n2._id] } });
        revisadas.forEach(n => expect(n.leida).toBe(true));
    });
});
