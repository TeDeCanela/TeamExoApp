const { response } = require('express');
const logger = require('../helpers/logger');
const Publicacion = require('../modelos/Publicacion');
const { Recurso } = require('../../src/modelos/Recurso');

/**
 * @swagger
 * /api/publicaciones:
 *   post:
 *     summary: Crear una nueva publicación
 *     tags: [Publicaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - contenido
 *             properties:
 *               titulo:
 *                 type: string
 *               contenido:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [Publicado, Borrador]
 *                 default: Borrador
 *               usuarioId:
 *                 type: integer
 *                 default: 1
 *               recursoId:
 *                 type: integer
 *                 description: ID del recurso asociado (opcional)
 *     responses:
 *       201:
 *         description: Publicación creada exitosamente
 *       400:
 *         description: Datos incompletos
 *       500:
 *         description: Error del servidor
 */
const crearPublicacion = async (req, res = response) => {
    const { titulo, contenido, estado = 'Borrador', usuarioId = 1, recursoId = null } = req.body;

    if (!titulo || !contenido) {
        return res.status(400).json({ msg: 'Título y contenido son requeridos' });
    }

    try {
        const count = await Publicacion.countDocuments();
        const nuevaPublicacion = new Publicacion({
            identificador: count + 1,
            titulo,
            contenido,
            estado,
            usuarioId,
            recursoId,  // Agregamos el recursoId
            fechaCreacion: new Date()
        });

        await nuevaPublicacion.save();

        res.status(201).json({
            msg: `Publicación "${titulo}" creada`,
            publicacion: nuevaPublicacion
        });
    } catch (error) {
        console.error('Error al crear publicación:', error);
        res.status(500).json({
            msg: 'Error en el servidor',
            error: error.message
        });
    }
};

/**
 * @swagger
 * /api/publicaciones/{identificador}/eliminar:
 *   patch:
 *     summary: Eliminar (marcar como eliminada) una publicación como moderador o administrador
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: path
 *         name: identificador
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la publicación
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuarioId:
 *                 type: integer
 *               rol:
 *                 type: string
 *                 enum: [Moderador, Administrador]
 *     responses:
 *       200:
 *         description: Publicación eliminada exitosamente
 *       403:
 *         description: Permiso denegado
 *       404:
 *         description: Publicación no encontrada
 *       500:
 *         description: Error del servidor
 */
const eliminarPublicacionModerador = async (req, res = response) => {
    const { identificador } = req.params;
    const usuarioRol = req.body.rol || req.query.rol;

    try {
        if(usuarioRol !== 'Moderador' && usuarioRol !== 'Administrador') {
            return res.status(403).json({
                msg: 'No tienes permisos para realizar esta acción'
            });
        }

        const publicacion = await Publicacion.findOne({ identificador: Number(identificador) });

        if (!publicacion) {
            return res.status(404).json({
                msg: 'Publicación no encontrada'
            });
        }

        const publicacionEliminada = await Publicacion.findOneAndUpdate(
            { identificador: Number(identificador) },
            {
                estado: 'Eliminado',
                eliminadoPor: req.body.usuarioId || null,
                fechaEliminacion: new Date()
            },
            { new: true }
        );

        res.json({
            msg: `La publicación "${publicacionEliminada.titulo}" ha sido eliminada`,
            publicacion: publicacionEliminada
        });

    } catch (error) {
        console.error(`Error al eliminar publicación: ${error.message}`);
        res.status(500).json({
            msg: 'Error en el servidor al intentar eliminar la publicación'
        });
    }
};

/**
 * @swagger
 * /api/publicaciones/buscar:
 *   get:
 *     summary: Buscar publicaciones por palabra clave, estado o categorías
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Palabra clave para buscar en título, contenido o palabras clave
 *       - in: query
 *         name: categorias
 *         schema:
 *           type: string
 *         description: Lista separada por comas de categorías
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Publicado, Borrador, Eliminado]
 *           default: Publicado
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Lista de publicaciones filtradas
 *       500:
 *         description: Error del servidor
 */
const buscarPublicaciones = async (req, res = response) => {
    const { query, categorias, estado = 'Publicado', limit = 10, page = 1, recursoId} = req.query;

    try {
        const filtro = { estado };

        if (recursoId) {
            filtro.recursoId = Number(recursoId);
        }

        if (categorias) {
            filtro.categorias = {
                $in: categorias.split(',')
            };
        }

        if (query) {
            const regex = new RegExp(query, 'i');
            filtro.$or = [
                { titulo: regex },
                { contenido: regex },
                { palabrasClave: { $in: [regex] } }
            ];
        }

        const options = {
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            sort: { fechaCreacion: -1 }
        };

        const publicaciones = await Publicacion.find(filtro, null, options);
        const total = await Publicacion.countDocuments(filtro);

        res.json({
            total,
            paginas: Math.ceil(total / parseInt(limit)),
            paginaActual: parseInt(page),
            resultados: publicaciones
        });
    } catch (error) {
        res.status(500).json({
            msg: 'Error al realizar la búsqueda',
            error: process.env.NODE_ENV === 'test' ? error.message : undefined
        });
    }
};

/**
 * @swagger
 * /api/publicaciones/con-recursos:
 *   get:
 *     summary: Obtener publicaciones con sus recursos asociados
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de publicaciones con recursos
 *       500:
 *         description: Error del servidor
 */
const obtenerPublicacionesConRecursos = async (req, res = response) => {
    try {
        const { usuarioId } = req.query;
        const filtro = usuarioId ? { usuarioId: Number(usuarioId) } : {};

        // Obtener publicaciones como objetos simples
        const publicaciones = await Publicacion.find(filtro).lean();

        // Obtener recursos asociados
        const resultados = await Promise.all(
            publicaciones.map(async (pub) => {
                let recurso = null;
                if (pub.recursoId) {
                    recurso = await Recurso.findOne({
                        identificador: pub.recursoId
                    }).lean() || null;
                }
                return {
                    ...pub,
                    recurso
                };
            })
        );

        return res.status(200).json(resultados);
    } catch (error) {
        console.error('Error en obtenerPublicacionesConRecursos:', error);
        return res.status(500).json({
            msg: 'Error al obtener publicaciones',
            error: error.message
        });
    }
};

module.exports = {
    crearPublicacion,
    eliminarPublicacionModerador,
    buscarPublicaciones,
    obtenerPublicacionesConRecursos
};
