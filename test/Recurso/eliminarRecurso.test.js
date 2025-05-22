const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { Recurso } = require('../../src/modelos/Recurso');

process.env.NODE_ENV = 'test';

describe('DELETE /api/recursos/:id - Eliminar recurso por ID', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await Recurso.deleteMany({});

        await Recurso.create({
            identificador: 888,
            formato: 1,
            tamano: 1500,
            URL: 'http://localhost:3000/uploads/recurso_888.jpg',
            usuarioId: 77,
            resolucion: 1080,
            tipo: 'Foto'
        });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('Debería eliminar el recurso si existe', async () => {
        const res = await request(app).delete('/api/recursos/888');

        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toBe('Recurso eliminado');
        expect(res.body.recurso.identificador).toBe(888);

        const recurso = await Recurso.findOne({ identificador: 888 });
        expect(recurso).toBeNull();
    });

    test('Debería devolver 404 si el recurso no existe', async () => {
        const res = await request(app).delete('/api/recursos/999999');
        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe('Recurso no encontrado');
    });

    test('DELETE /api/recursos/:id - Recurso no encontrado', async () => {
        jest.spyOn(Recurso, 'findOneAndDelete').mockResolvedValue(null);

        const res = await request(app).delete('/api/recursos/999');

        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toMatch(/no encontrado/i);

        Recurso.findOneAndDelete.mockRestore();
    });

});
