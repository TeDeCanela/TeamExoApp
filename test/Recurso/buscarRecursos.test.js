const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { Recurso } = require('../../src/modelos/Recurso');

process.env.NODE_ENV = 'test';

describe('GET /api/recursos/buscar - Buscar recursos por filtros', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await Recurso.deleteMany({});

        await Recurso.create([
            {
                identificador: 700,
                tipo: 'Foto',
                formato: 1,
                tamano: 1500,
                URL: 'http://localhost:3000/uploads/foto1.jpg',
                usuarioId: 1,
                resolucion: 720
            },
            {
                identificador: 701,
                tipo: 'Foto',
                formato: 2,
                tamano: 2500,
                URL: 'http://localhost:3000/uploads/foto2.jpg',
                usuarioId: 1,
                resolucion: 1080
            },
            {
                identificador: 702,
                tipo: 'Audio',
                formato: 1,
                tamano: 3000,
                URL: 'http://localhost:3000/uploads/audio1.mp3',
                usuarioId: 2,
                duracion: 180
            }
        ]);
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Devuelve recursos filtrados por tipo', async () => {
        const res = await request(app).get('/api/recursos/buscar?tipo=Foto');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);

        res.body.forEach(recurso => {
            expect(recurso.tipo).toBe('Foto');
        });
    });

    test('Devuelve recursos filtrados por tipo y formato', async () => {
        const res = await request(app).get('/api/recursos/buscar?tipo=Foto&formato=2');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].formato).toBe(2);
        expect(res.body[0].tipo).toBe('Foto');
    });

    test('Devuelve recursos filtrados por usuarioId', async () => {
        const res = await request(app).get('/api/recursos/buscar?usuarioId=2');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].usuarioId).toBe(2);
    });

    test('Devuelve lista vacía si no hay coincidencias', async () => {
        const res = await request(app).get('/api/recursos/buscar?tipo=Video');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });
});
