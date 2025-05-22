const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { Recurso } = require('../../src/modelos/Recurso');

process.env.NODE_ENV = 'test';

describe('GET /api/recursos/usuario/:usuarioId - Obtener recursos por usuario', () => {
    const usuarioDePrueba = 42;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await Recurso.deleteMany({});

        await Recurso.create([
            {
                identificador: 1,
                formato: 1,
                tamano: 500,
                URL: 'http://localhost:3000/uploads/recurso_1.jpg',
                usuarioId: usuarioDePrueba,
                resolucion: 720,
                tipo: 'Foto'
            },
            {
                identificador: 2,
                formato: 2,
                tamano: 3000,
                URL: 'http://localhost:3000/uploads/recurso_2.mp3',
                usuarioId: usuarioDePrueba,
                duracion: 180,
                tipo: 'Audio'
            },
            {
                identificador: 3,
                formato: 1,
                tamano: 900,
                URL: 'http://localhost:3000/uploads/recurso_3.jpg',
                usuarioId: 99,
                resolucion: 1080,
                tipo: 'Foto'
            }
        ]);
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debería devolver solo los recursos del usuario indicado', async () => {
        const res = await request(app).get(`/api/recursos/usuario/${usuarioDePrueba}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);

        for (const recurso of res.body) {
            expect(recurso.usuarioId).toBe(usuarioDePrueba);
        }
    });

    test('Debería devolver lista vacía si el usuario no tiene recursos', async () => {
        const res = await request(app).get('/api/recursos/usuario/777');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });
    test('GET /api/recursos/usuario/:id - Error simulado', async () => {
        jest.spyOn(Recurso, 'find').mockImplementation(() => {
            throw new Error('Error simulado');
        });

        const res = await request(app).get('/api/recursos/usuario/1');

        expect(res.statusCode).toBe(500);
        expect(res.body.msg).toBe('Error del servidor');

        Recurso.find.mockRestore();
    });

});
