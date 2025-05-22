const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { Recurso } = require('../../src/modelos/Recurso');

process.env.NODE_ENV = 'test';

describe('GET /api/recursos/:id - Obtener recurso por ID', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debería devolver el recurso correctamente si existe', async () => {
        // Inserta un recurso directamente
        await Recurso.create({
            identificador: 999,
            formato: 1,
            tamano: 1234,
            URL: 'http://localhost:3000/uploads/recurso_999.jpg',
            usuarioId: 42,
            resolucion: 1080,
            tipo: 'Foto'
        });

        const res = await request(app).get('/api/recursos/999');

        expect(res.statusCode).toBe(200);
        expect(res.body.identificador).toBe(999);
        expect(res.body.URL).toContain('recurso_999.jpg');
    });

    test('Debería devolver 404 si el recurso no existe', async () => {
        const res = await request(app).get('/api/recursos/123456');
        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe('Recurso no encontrado');
    });
    test('GET /api/recursos/:id - Recurso no encontrado', async () => {
        jest.spyOn(Recurso, 'findOne').mockResolvedValue(null);

        const res = await request(app).get('/api/recursos/999');

        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toMatch(/no encontrado/i);

        Recurso.findOne.mockRestore();
    });

});
