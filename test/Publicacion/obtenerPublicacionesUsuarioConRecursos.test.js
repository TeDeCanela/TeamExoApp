const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Publicacion = require('../../src/modelos/Publicacion');

describe('GET /api/publicaciones/usuario/:usuarioId', () => {
    beforeAll(async () => {
        // Conectar a la base de datos de prueba
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/teamexodb_test');

        // Limpiar colecciones
        await Publicacion.deleteMany({});
        await mongoose.connection.db.collection('recursos').deleteMany({});

        // Crear datos de prueba - Publicaciones
        const publicacionesTest = [
            {
                identificador: 1,
                titulo: 'Publicación 1 Usuario 123',
                contenido: 'Contenido prueba 1',
                estado: 'Publicado',
                usuarioId: 123,
                fechaCreacion: new Date()
            },
            {
                identificador: 2,
                titulo: 'Publicación 2 Usuario 123',
                contenido: 'Contenido prueba 2',
                estado: 'Publicado',
                usuarioId: 123,
                fechaCreacion: new Date()
            },
            {
                identificador: 3,
                titulo: 'Borrador Usuario 123',
                contenido: 'No debe aparecer',
                estado: 'Borrador',
                usuarioId: 123,
                fechaCreacion: new Date()
            },
            {
                identificador: 4,
                titulo: 'Publicación Usuario 456',
                contenido: 'Contenido otro usuario',
                estado: 'Publicado',
                usuarioId: 456,
                fechaCreacion: new Date()
            }
        ];

        await Publicacion.insertMany(publicacionesTest);

        // Crear datos de prueba - Recursos
        const recursosTest = [
            {
                identificador: 1,
                formato: 1,
                tamano: 1024,
                URL: 'http://ejemplo.com/recurso1',
                usuarioId: 123,
                publicacionId: 1,
                tipo: 'Foto',
                resolucion: 1080,
                __t: 'Foto'
            },
            {
                identificador: 2,
                formato: 2,
                tamano: 2048,
                URL: 'http://ejemplo.com/recurso2',
                usuarioId: 123,
                publicacionId: 2,
                tipo: 'Video',
                resolucion: 720,
                __t: 'Video'
            },
            {
                identificador: 3,
                formato: 3,
                tamano: 512,
                URL: 'http://ejemplo.com/recurso3',
                usuarioId: 456,
                publicacionId: 4,
                tipo: 'Audio',
                duracion: 360,
                __t: 'Audio'
            }
        ];

        await mongoose.connection.db.collection('recursos').insertMany(recursosTest);
    });

    afterAll(async () => {
        // Limpiar y desconectar
        await Publicacion.deleteMany({});
        await mongoose.connection.db.collection('recursos').deleteMany({});
        await mongoose.connection.close();
    });

    test('debe devolver solo publicaciones publicadas del usuario especificado', async () => {
        const res = await request(app)
            .get('/api/publicaciones/usuario/123');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);

        // Verificar que solo son del usuario 123
        expect(res.body[0].usuarioId).toBe(123);
        expect(res.body[1].usuarioId).toBe(123);

        // Verificar que solo son publicadas
        expect(res.body[0].estado).toBe('Publicado');
        expect(res.body[1].estado).toBe('Publicado');

        // Verificar títulos
        expect(res.body[0].titulo).toBe('Publicación 1 Usuario 123');
        expect(res.body[1].titulo).toBe('Publicación 2 Usuario 123');
    });

    test('debe incluir los recursos asociados correctamente', async () => {
        const res = await request(app)
            .get('/api/publicaciones/usuario/123');

        expect(res.statusCode).toBe(200);

        // Verificar que cada publicación tiene su recurso
        expect(res.body[0].recurso).toBeDefined();
        expect(res.body[1].recurso).toBeDefined();

        // Verificar datos del recurso
        expect(res.body[0].recurso.publicacionId).toBe(1);
        expect(res.body[0].recurso.URL).toBe('http://ejemplo.com/recurso1');
        expect(res.body[0].recurso.tipo).toBe('Foto');

        expect(res.body[1].recurso.publicacionId).toBe(2);
        expect(res.body[1].recurso.URL).toBe('http://ejemplo.com/recurso2');
        expect(res.body[1].recurso.tipo).toBe('Video');
    });

    test('debe devolver array vacío si el usuario no tiene publicaciones', async () => {
        const res = await request(app)
            .get('/api/publicaciones/usuario/999'); // Usuario inexistente

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    test('debe manejar correctamente usuarios con publicaciones sin recursos', async () => {
        // 1. Obtener el máximo ID usando el driver nativo para evitar problemas
        const result = await mongoose.connection.db.collection('publicacions')
            .find()
            .sort({ identificador: -1 })
            .limit(1)
            .toArray();

        const maxId = result.length > 0 ? result[0].identificador : 0;
        const newId = maxId + 1;

        // 2. Crear publicación usando el driver nativo para mejor control
        await mongoose.connection.db.collection('publicacions').insertOne({
            identificador: newId,
            titulo: 'Publicación sin recurso',
            contenido: 'Contenido prueba',
            estado: 'Publicado',
            usuarioId: 789,
            fechaCreacion: new Date()
        });

        // 3. Verificar que se creó correctamente
        const exists = await Publicacion.findOne({ identificador: newId });
        expect(exists).not.toBeNull();

        // 4. Ejecutar la consulta
        const res = await request(app)
            .get('/api/publicaciones/usuario/789')
            .expect(200);

        // 5. Verificaciones
        expect(res.body.length).toBe(1);
        expect(res.body[0].recurso).toBeNull(); // Asegura que es null según el pipeline
    });

    test('debe manejar errores internos correctamente', async () => {
        // Simular un error en la base de datos
        jest.spyOn(Publicacion, 'aggregate').mockImplementationOnce(() => {
            throw new Error('Error de base de datos simulado');
        });

        const res = await request(app)
            .get('/api/publicaciones/usuario/123');

        expect(res.statusCode).toBe(500);
        expect(res.body.msg).toBe('Error interno del servidor');
        expect(res.body.error).toBeDefined();

        // Restaurar implementación original
        jest.restoreAllMocks();
    });

    test('debe convertir correctamente el usuarioId a número', async () => {
        // Probar con usuarioId como string en la ruta
        const res = await request(app)
            .get('/api/publicaciones/usuario/123');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });
});