const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { Recurso } = require('../../src/modelos/Recurso');

process.env.NODE_ENV = 'test';

describe('PUT /api/recursos/:id - Actualizar recurso por ID', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await Recurso.deleteMany({});

        await Recurso.create({
            identificador: 500,
            formato: 1,
            tamano: 1500,
            URL: 'http://localhost:3000/uploads/recurso_500.jpg',
            usuarioId: 1,
            resolucion: 720,
            tipo: 'Foto'
        });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debería actualizar un recurso tipo Foto', async () => {
        const res = await request(app)
            .put('/api/recursos/500')
            .send({
                formato: 2,
                tamano: 2500,
                resolucion: 1080
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toBe('Recurso actualizado');
        expect(res.body.recurso.formato).toBe(2);
        expect(res.body.recurso.tamano).toBe(2500);
        expect(res.body.recurso.resolucion).toBe(1080);
    });

    test('Debería devolver 404 si el recurso no existe', async () => {
        const res = await request(app)
            .put('/api/recursos/999999')
            .send({
                formato: 1,
                tamano: 2500,
                resolucion: 1080
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe('Recurso no encontrado');
    });
});
