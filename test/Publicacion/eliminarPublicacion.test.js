const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Publicacion = require('../../src/modelos/Publicacion');
const Usuario = require('../../src/modelos/Usuario');

describe('DELETE /api/publicaciones/:id - eliminarPublicacionModerador', () => {
    let publicacionCreada;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/teamexodb_test');
        await Publicacion.deleteMany({});

        // Crear publicación de prueba
        publicacionCreada = await Publicacion.create({
            identificador: 1,
            titulo: 'Publicación de prueba',
            contenido: 'Contenido de prueba',
            estado: 'Publicado',
            usuarioId: 1,
            fechaCreacion: new Date()
        });
    });

    afterAll(async () => {
        await Publicacion.deleteMany({});
        await mongoose.connection.close();
    });

    test('debería permitir eliminar una publicación como Moderador', async () => {
        const res = await request(app)
            .delete(`/api/publicaciones/${publicacionCreada.identificador}`)
            .send({
                rol: 'Moderador',
                usuarioId: 2 // ID de usuario ficticio
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toMatch(/ha sido eliminada/i);
        expect(res.body.publicacion.estado).toBe('Eliminado');
    });

    test('debería permitir eliminar una publicación como Administrador', async () => {
        // Crear otra publicación para esta prueba
        const otraPublicacion = await Publicacion.create({
            identificador: 2,
            titulo: 'Otra publicación',
            contenido: 'Más contenido',
            estado: 'Publicado',
            usuarioId: 1,
            fechaCreacion: new Date()
        });

        const res = await request(app)
            .delete(`/api/publicaciones/${otraPublicacion.identificador}`)
            .send({
                rol: 'Administrador',
                usuarioId: 3
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.publicacion.estado).toBe('Eliminado');
    });

    test('debería permitir al creador eliminar su propia publicación', async () => {
        const publicacionUsuario = await Publicacion.create({
            identificador: 4,
            titulo: 'Mi publicación',
            contenido: 'Contenido personal',
            estado: 'Publicado',
            usuarioId: 5,
            fechaCreacion: new Date()
        });

        const res = await request(app)
            .delete(`/api/publicaciones/${publicacionUsuario.identificador}`)
            .send({
                rol: 'Fan',
                usuarioId: 5
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.publicacion.estado).toBe('Eliminado');
    });

    test('debería fallar si un Fan intenta eliminar publicación de otro usuario', async () => {
        const publicacionOtroUsuario = await Publicacion.create({
            identificador: 5,
            titulo: 'Publicación de otro',
            contenido: 'Contenido',
            estado: 'Publicado',
            usuarioId: 6,
            fechaCreacion: new Date()
        });

        const res = await request(app)
            .delete(`/api/publicaciones/${publicacionOtroUsuario.identificador}`)
            .send({
                rol: 'Fan',
                usuarioId: 7
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.msg).toMatch(/No tienes permisos/i);
    });

    test('debería fallar si la publicación no existe', async () => {
        const res = await request(app)
            .delete('/api/publicaciones/9999') // ID que no existe
            .send({
                rol: 'Moderador',
                usuarioId: 2
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toMatch(/no encontrada/i);
    });
});