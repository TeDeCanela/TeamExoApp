const grpc = require('@grpc/grpc-js');
const mongoose = require('mongoose');
const { obtenerEstadisticas } = require('../../servicios/serviciosgRPC/grcpEstadistica/controladores/EstadisticaGRPC');

const Reaccion = require('../../src/modelos/Reaccion');
const Comentario = require('../../src/modelos/Comentario');
const Estadistica = require('../../src/modelos/Estadistica');
const Publicacion = require('../../src/modelos/Publicacion');
const Notificacion = require('../../src/modelos/Notificacion');
const Usuario = require('../../src/modelos/Usuario');
const modelosRecurso = require('../../src/modelos/Recurso');
const Recurso = modelosRecurso.Recurso;

jest.mock('../../src/modelos/Reaccion');
jest.mock('../../src/modelos/Comentario');
jest.mock('../../src/modelos/Estadistica');
jest.mock('../../src/modelos/Publicacion');
jest.mock('../../src/modelos/Recurso', () => {
    const mockAggregate = jest.fn();
    return {
        __esModule: true,
        Recurso: { aggregate: mockAggregate },
        Foto: {},
        Video: {},
        Audio: {}
    };
});
jest.mock('../../src/modelos/Notificacion');
jest.mock('../../src/modelos/Usuario');

Reaccion.aggregate = jest.fn();
Comentario.aggregate = jest.fn();
Publicacion.aggregate = jest.fn();
Publicacion.countDocuments = jest.fn();
Publicacion.findById = jest.fn();
Recurso.aggregate = jest.fn();
Notificacion.countDocuments = jest.fn();
Estadistica.findOneAndUpdate = jest.fn();
Usuario.findOne = jest.fn();

describe('obtenerEstadisticas', () => {
    it('debería devolver estadísticas correctamente con títulos de publicaciones', async () => {
        const idLike = new mongoose.Types.ObjectId();
        const idComentario = new mongoose.Types.ObjectId();
        const idUsuario1 = 1;
        const idUsuario2 = 2;
        const idUsuario3 = 3;

        Reaccion.aggregate
            .mockResolvedValueOnce([{ _id: idLike, total: 10 }])       // topLikes
            .mockResolvedValueOnce([{ _id: idUsuario1, total: 15 }]);  // usuarioTopReacciones

        Comentario.aggregate
            .mockResolvedValueOnce([{ _id: idComentario, total: 5 }])  // topComentarios
            .mockResolvedValueOnce([{ _id: idUsuario2, total: 9 }]);   // usuarioTopComentarios

        Publicacion.countDocuments.mockResolvedValue(100);

        Publicacion.aggregate
            .mockResolvedValueOnce([{ _id: '2024-06-09', total: 20 }]) // diaConMasPublicaciones
            .mockResolvedValueOnce([{ _id: idUsuario3, total: 8 }]);   // usuarioTopPublicaciones

        Publicacion.findById.mockImplementation((id) => {
            const publicaciones = {
                [idLike.toString()]: { titulo: 'Publicación con más likes' },
                [idComentario.toString()]: { titulo: 'Publicación con más comentarios' }
            };
            return {
                lean: () => Promise.resolve(publicaciones[id.toString()] || { titulo: 'Desconocido' })
            };
        });

        Usuario.findOne.mockImplementation(({ usuarioId }) => {
            const usuarios = {
                [idUsuario1]: { nombre: 'Carlos', usuarioId: 0 },
                [idUsuario2]: { nombre: 'Luisa', usuarioId: 0 },
                [idUsuario3]: { nombre: 'Ana', usuarioId: 0 }
            };
            return {
                lean: () => Promise.resolve(usuarios[usuarioId] || { nombre: 'Desconocido', usuarioId: -1 })
            };
        });

        Recurso.aggregate.mockResolvedValue([
            { _id: 'Foto', total: 30 },
            { _id: 'Video', total: 15 },
            { _id: 'Audio', total: 5 }
        ]);

        Notificacion.countDocuments.mockResolvedValue(12);
        Estadistica.findOneAndUpdate.mockResolvedValue();

        const callback = jest.fn();

        await obtenerEstadisticas({}, callback);

        expect(callback).toHaveBeenCalledWith(null, {
            topLikes: {
                publicacionId: idLike.toString(),
                titulo: 'Publicación con más likes',
                total: 10
            },
            topComentarios: {
                publicacionId: idComentario.toString(),
                titulo: 'Publicación con más comentarios',
                total: 5
            },
            totalPublicaciones: 100,
            diaConMasPublicaciones: '2024-06-09',
            publicacionesEnEseDia: 20,
            usuarioTopPublicaciones: { nombre: 'Ana', usuarioId: 0 },
            usuarioTopReacciones: { nombre: 'Carlos', usuarioId: 0 },
            usuarioTopComentarios: { nombre: 'Luisa', usuarioId: 0 },
            recursosPorTipo: [
                { tipo: 'Foto', total: 30 },
                { tipo: 'Video', total: 15 },
                { tipo: 'Audio', total: 5 }
            ],
            notificacionesPendientes: 12
        });
    });
});