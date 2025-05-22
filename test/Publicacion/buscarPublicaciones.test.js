const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Publicacion = require('../../src/modelos/Publicacion');

describe('GET /api/publicaciones - buscarPublicaciones', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/teamexodb_test');
        await Publicacion.deleteMany({});

        // Crear publicaciones de prueba
        await Publicacion.create([
            {
                identificador: 1,
                titulo: 'Título con palabra clave',
                contenido: 'Contenido de prueba con palabra clave',
                estado: 'Publicado',
                usuarioId: 1,
                palabrasClave: ['clave1', 'clave2'],
                categorias: ['tecnologia'],
                fechaCreacion: new Date()
            },
            {
                identificador: 2,
                titulo: 'Otra publicación sobre deportes',
                contenido: 'Contenido diferente sobre fútbol',
                estado: 'Publicado',
                usuarioId: 1,
                categorias: ['deportes', 'tecnologia'],
                fechaCreacion: new Date(Date.now() - 1000 * 60 * 60) // 1 hora antes
            },
            {
                identificador: 3,
                titulo: 'Borrador no publicado',
                contenido: 'No debería aparecer en búsquedas normales',
                estado: 'Borrador',
                usuarioId: 1,
                fechaCreacion: new Date()
            }
        ]);
    });

    afterAll(async () => {
        await Publicacion.deleteMany({});
        await mongoose.connection.close();
    });

    test('debería buscar publicaciones por palabra clave', async () => {
        const res = await request(app)
            .get('/api/publicaciones')
            .query({ query: 'palabra clave' });

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(1);
        expect(res.body.resultados[0].titulo).toMatch(/palabra clave/i);
    });


    test('debería paginar resultados', async () => {
        const res = await request(app)
            .get('/api/publicaciones')
            .query({ limit: 1, page: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body.resultados.length).toBe(1);
        expect(res.body.paginas).toBeGreaterThan(1);
    });

    test('debería ordenar por fecha descendente', async () => {
        const res = await request(app)
            .get('/api/publicaciones');

        expect(res.statusCode).toBe(200);
        const fechas = res.body.resultados.map(p => new Date(p.fechaCreacion));
        const estaOrdenado = fechas.every((fecha, i, arr) =>
            i === 0 || fecha <= arr[i - 1]
        );
        expect(estaOrdenado).toBe(true);
    });


    test('debería filtrar por estado específico', async () => {
        const res = await request(app)
            .get('/api/publicaciones')
            .query({ estado: 'Borrador' });

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(1);
        expect(res.body.resultados[0].titulo).toMatch(/Borrador/i);
    });

    test('debería mostrar solo publicadas por defecto', async () => {
        const res = await request(app)
            .get('/api/publicaciones');

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(2);
        expect(res.body.resultados.some(p => p.estado !== 'Publicado')).toBe(false);
    });

    test('debería manejar errores correctamente', async () => {
        // Simular un error en la consulta
        const originalFind = Publicacion.find;
        Publicacion.find = jest.fn().mockRejectedValue(new Error('Error de prueba'));

        const res = await request(app)
            .get('/api/publicaciones');

        expect(res.statusCode).toBe(500);
        expect(res.body.msg).toBe('Error al realizar la búsqueda');

        // Restaurar implementación original
        Publicacion.find = originalFind;
    });

});