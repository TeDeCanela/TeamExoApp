const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Publicacion = require('../../src/modelos/Publicacion');
const {Recurso} = require('../../src/modelos/Recurso');

describe('GET /api/publicaciones/buscar', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/teamexodb_test');

        // Limpiar todas las colecciones relevantes
        await Publicacion.deleteMany({});
        await mongoose.connection.db.collection('recursos').deleteMany({}); // Acceso directo a la colección

        // Crear datos de prueba
        const publicaciones = [
            {
                identificador: 1,
                titulo: 'Publicación de prueba 1',
                contenido: 'Contenido de prueba 1',
                estado: 'Publicado',
                usuarioId: 1,
                fechaCreacion: new Date(),
                categorias: ['deportes', 'musica']
            },
            {
                identificador: 2,
                titulo: 'Publicación de prueba 2',
                contenido: 'Contenido de prueba 2',
                estado: 'Publicado',
                usuarioId: 1,
                fechaCreacion: new Date(),
                categorias: ['tecnologia']
            },
            {
                identificador: 3,
                titulo: 'Borrador de prueba',
                contenido: 'Contenido de borrador',
                estado: 'Borrador',
                usuarioId: 1,
                fechaCreacion: new Date(),
                categorias: ['deportes']
            }
        ];

        await Publicacion.insertMany(publicaciones);

        // Insertar recursos directamente en la colección
        await mongoose.connection.db.collection('recursos').insertMany([
            {
                identificador: 1,
                formato: 1,
                tamano: 1024,
                URL: 'http://ejemplo.com/1',
                usuarioId: 1,
                publicacionId: 1,
                tipo: 'Foto',
                resolucion: 1080,
                __t: 'Foto' // Importante para discriminadores
            },
            {
                identificador: 2,
                formato: 2,
                tamano: 2048,
                URL: 'http://ejemplo.com/2',
                usuarioId: 1,
                publicacionId: 2,
                tipo: 'Video',
                resolucion: 720,
                __t: 'Video' // Importante para discriminadores
            }
        ]);
    });

    afterAll(async () => {
        await Publicacion.deleteMany({});
        await mongoose.connection.db.collection('recursos').deleteMany({});
        await mongoose.connection.close();
    });
    test('debe devolver publicaciones publicadas por defecto', async () => {
        const res = await request(app)
            .get('/api/publicaciones/buscar');

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(2); // Solo las publicadas
        expect(res.body.resultados.length).toBe(2);
        expect(res.body.resultados[0].estado).toBe('Publicado');
        expect(res.body.resultados[1].estado).toBe('Publicado');
    });

    test('debe filtrar por tipo de recurso', async () => {
        const res = await request(app)
            .get('/api/publicaciones/buscar?tipoRecurso=Foto');

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(1);
        expect(res.body.resultados[0].recurso.tipo).toBe('Foto');
    });

    test('debe buscar por texto en título o contenido', async () => {
        const res = await request(app)
            .get('/api/publicaciones/buscar?query=prueba 1');

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(1);
        expect(res.body.resultados[0].titulo).toContain('1');
    });


    test('debe paginar los resultados correctamente', async () => {
        const res = await request(app)
            .get('/api/publicaciones/buscar?limit=1&page=1');

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(2);
        expect(res.body.resultados.length).toBe(1);
        expect(res.body.paginas).toBe(2);
        expect(res.body.paginaActual).toBe(1);
    });

    test('debe manejar errores correctamente', async () => {
        // Simular un error en la base de datos
        jest.spyOn(Publicacion, 'aggregate').mockImplementationOnce(() => {
            throw new Error('Error de base de datos');
        });

        const res = await request(app)
            .get('/api/publicaciones/buscar');

        expect(res.statusCode).toBe(500);
        expect(res.body.msg).toBe('Error al realizar la búsqueda');

        // Restaurar la implementación original
        jest.restoreAllMocks();
    });

    test('debe devolver resultados vacíos si no hay coincidencias', async () => {
        const res = await request(app)
            .get('/api/publicaciones/buscar?query=xyz123');

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(0);
        expect(res.body.resultados.length).toBe(0);
    });
});