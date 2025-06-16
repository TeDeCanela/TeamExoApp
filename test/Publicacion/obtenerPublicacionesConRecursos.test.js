const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Publicacion = require('../../src/modelos/Publicacion');

describe('GET /api/publicaciones/con-recursos', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/teamexodb_test');

        // Limpiar colecciones
        await Publicacion.deleteMany({});
        await mongoose.connection.db.collection('recursos').deleteMany({});

        // Crear datos de prueba - Publicaciones
        const publicacionesTest = [
            {
                identificador: 1,
                titulo: 'Publicación Publicada 1',
                contenido: 'Contenido prueba 1',
                estado: 'Publicado',
                usuarioId: 123,
                fechaCreacion: new Date()
            },
            {
                identificador: 2,
                titulo: 'Publicación Publicada 2',
                contenido: 'Contenido prueba 2',
                estado: 'Publicado',
                usuarioId: 123,
                fechaCreacion: new Date()
            },
            {
                identificador: 3,
                titulo: 'Borrador No Publicado',
                contenido: 'No debe aparecer',
                estado: 'Borrador',
                usuarioId: 123,
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
            }
        ];

        await mongoose.connection.db.collection('recursos').insertMany(recursosTest);
    });

    afterAll(async () => {
        await Publicacion.deleteMany({});
        await mongoose.connection.db.collection('recursos').deleteMany({});
        await mongoose.connection.close();
    });

    test('debe devolver solo publicaciones con estado "Publicado"', async () => {
        const res = await request(app)
            .get('/api/publicaciones/con-recursos')
            .expect(200);

        expect(res.body.length).toBe(2);
        expect(res.body.every(p => p.estado === 'Publicado')).toBeTruthy();
        expect(res.body.some(p => p.titulo === 'Borrador No Publicado')).toBeFalsy();
    });

    test('debe incluir los recursos asociados a cada publicación', async () => {
        const res = await request(app)
            .get('/api/publicaciones/con-recursos')
            .expect(200);

        // Verificar que cada publicación tiene su recurso
        const pubConRecurso1 = res.body.find(p => p.identificador === 1);
        expect(pubConRecurso1.recurso).toBeDefined();
        expect(pubConRecurso1.recurso.publicacionId).toBe(1);
        expect(pubConRecurso1.recurso.tipo).toBe('Foto');

        const pubConRecurso2 = res.body.find(p => p.identificador === 2);
        expect(pubConRecurso2.recurso).toBeDefined();
        expect(pubConRecurso2.recurso.publicacionId).toBe(2);
        expect(pubConRecurso2.recurso.tipo).toBe('Video');
    });

    test('debe manejar publicaciones sin recursos asociados', async () => {
        // Usar el driver nativo para evitar problemas con Mongoose
        const collection = mongoose.connection.db.collection('publicacions');

        // Obtener el máximo ID actual de forma segura
        const lastPub = await collection.find().sort({ identificador: -1 }).limit(1).toArray();
        const maxId = lastPub.length > 0 ? lastPub[0].identificador : 0;
        const nuevoIdentificador = maxId + 1;

        // Insertar usando el driver nativo
        await collection.insertOne({
            identificador: nuevoIdentificador,
            titulo: `Publicación sin recurso ${nuevoIdentificador}`,
            contenido: 'Contenido sin recurso',
            estado: 'Publicado',
            usuarioId: 789,
            fechaCreacion: new Date()
        });

        // Verificar inserción
        const exists = await collection.findOne({ identificador: nuevoIdentificador });
        expect(exists).not.toBeNull();

        // Ejecutar la consulta
        const res = await request(app)
            .get('/api/publicaciones/con-recursos')
            .expect(200);

        // Buscar la publicación
        const pubSinRecurso = res.body.find(p => p.identificador === nuevoIdentificador);
        expect(pubSinRecurso).toBeDefined();
        expect(pubSinRecurso.recurso).toBeNull();
    });

    test('debe manejar errores internos correctamente', async () => {
        // Simular un error en la base de datos
        jest.spyOn(Publicacion, 'aggregate').mockImplementationOnce(() => {
            throw new Error('Error de base de datos simulado');
        });

        const res = await request(app)
            .get('/api/publicaciones/con-recursos')
            .expect(500);

        expect(res.body.msg).toBe('Error interno del servidor');
        expect(res.body.error).toBeDefined();

        // Restaurar implementación original
        jest.restoreAllMocks();
    });

    test('debe devolver array vacío si no hay publicaciones', async () => {
        // Limpiar solo las publicaciones
        await Publicacion.deleteMany({});

        const res = await request(app)
            .get('/api/publicaciones/con-recursos')
            .expect(200);

        expect(res.body).toEqual([]);
    });
});