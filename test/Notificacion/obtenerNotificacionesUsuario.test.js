const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Notificacion = require('../../src/modelos/Notificacion');

process.env.NODE_ENV = 'test';

describe('GET /api/notificaciones/:usuarioId', () => {
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

    test('Devuelve notificaciones del usuario', async () => {
        await Notificacion.create({
            notificacionId: 1,
            usuarioId: 123,
            tipo: 'comentario',
            mensaje: 'Tienes un nuevo comentario'
        });

        const res = await request(app).get('/api/notificaciones/usuario/123');

        expect(res.statusCode).toBe(200);
        expect(res.body.resultados.length).toBe(1);
        expect(res.body.resultados[0].mensaje).toBe('Tienes un nuevo comentario');
    });

    test('Filtra por leída = false y las marca como leídas', async () => {
        const noti = await Notificacion.create({
            notificacionId: 2,
            usuarioId: 123,
            tipo: 'reaccion',
            mensaje: 'Alguien reaccionó a tu publicación',
            leida: false
        });

        const res = await request(app).get('/api/notificaciones/usuario/123?leida=false');

        expect(res.statusCode).toBe(200);
        expect(res.body.resultados.length).toBe(1);

        // Verificar que ahora esté marcada como leída en la base
        const actualizada = await Notificacion.findOne({ notificacionId: 2 });
        expect(actualizada.leida).toBe(true);
    });

    test('Devuelve paginación correctamente', async () => {
        for (let i = 1; i <= 15; i++) {
            await Notificacion.create({
                notificacionId: i + 100,
                usuarioId: 456,
                tipo: 'seguimiento',
                mensaje: `Notificación ${i}`
            });
        }

        const res = await request(app).get('/api/notificaciones/usuario/456?limit=5&page=2');

        expect(res.statusCode).toBe(200);
        expect(res.body.resultados.length).toBe(5);
        expect(res.body.paginaActual).toBe(2);
        expect(res.body.paginas).toBe(3);
    });
});
