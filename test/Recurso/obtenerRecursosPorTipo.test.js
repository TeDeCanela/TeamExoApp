const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { Recurso } = require('../../src/modelos/Recurso');

process.env.NODE_ENV = 'test';

describe('GET /api/recursos/tipo/:tipo - Obtener recursos por tipo', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await Recurso.deleteMany({});

        await Recurso.create([
            {
                identificador: 10,
                formato: 1,
                tamano: 500,
                URL: 'http://localhost:3000/uploads/recurso_10.jpg',
                usuarioId: 1,
                resolucion: 720,
                tipo: 'Foto'
            },
            {
                identificador: 11,
                formato: 2,
                tamano: 3000,
                URL: 'http://localhost:3000/uploads/recurso_11.mp3',
                usuarioId: 2,
                duracion: 180,
                tipo: 'Audio'
            },
            {
                identificador: 12,
                formato: 1,
                tamano: 900,
                URL: 'http://localhost:3000/uploads/recurso_12.jpg',
                usuarioId: 1,
                resolucion: 1080,
                tipo: 'Foto'
            }
        ]);
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debería devolver todos los recursos de tipo Foto', async () => {
        const res = await request(app).get('/api/recursos/tipo/Foto');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);

        for (const recurso of res.body) {
            expect(recurso.tipo).toBe('Foto');
        }
    });

    test('Debería devolver solo recursos de tipo Audio', async () => {
        const res = await request(app).get('/api/recursos/tipo/Audio');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].tipo).toBe('Audio');
    });

    test('Debería devolver lista vacía si no hay recursos del tipo indicado', async () => {
        const res = await request(app).get('/api/recursos/tipo/Video');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });
});
