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
 *     summary: Busca publicaciones con múltiples filtros (texto, categorías, tipo de recurso)
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Texto para buscar en título o contenido
 *       - in: query
 *         name: categorias
 *         schema:
 *           type: string
 *         description: Categorías separadas por comas
 *       - in: query
 *         name: tipoRecurso
 *         schema:
 *           type: string
 *           enum: [Foto, Video, Audio]
 *         description: Tipo de recurso asociado (Foto/Video/Audio)
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Publicado, Borrador, Eliminado]
 *           default: Publicado
 *         description: Filtro por estado de publicación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Límite de resultados por página
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda paginados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total de resultados
 *                 paginas:
 *                   type: integer
 *                   description: Total de páginas
 *                 paginaActual:
 *                   type: integer
 *                   description: Página actual
 *                 resultados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PublicacionConRecurso'
 *       500:
 *         description: Error del servidor
 */
const buscarPublicaciones = async (req, res = response) => {
    const {
        query,
        categorias,
        tipoRecurso,
        estado = 'Publicado',
        limit = 10,
        page = 1
    } = req.query;

    try {
        const pipeline = [
            {
                $match: { estado }
            },
            {
                $lookup: {
                    from: 'recursos',
                    localField: 'identificador',
                    foreignField: 'publicacionId',
                    as: 'recurso'
                }
            },
            {
                $addFields: {
                    recurso: { $arrayElemAt: ['$recurso', 0] }
                }
            }
        ];

        if (tipoRecurso) {
            pipeline.push({
                $match: {
                    'recurso.tipo': tipoRecurso
                }
            });
        }

        if (query) {
            const regex = new RegExp(query, 'i');
            pipeline.push({
                $match: {
                    $or: [
                        { titulo: regex },
                        { contenido: regex }
                    ]
                }
            });
        }

        if (categorias) {
            pipeline.push({
                $match: {
                    categorias: {
                        $in: categorias.split(',')
                    }
                }
            });
        }

        const paginationPipeline = [
            ...pipeline,
            { $sort: { fechaCreacion: -1 } },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        ];

        const countPipeline = [
            ...pipeline,
            { $count: 'total' }
        ];

        const [publicaciones, totalResult] = await Promise.all([
            Publicacion.aggregate(paginationPipeline),
            Publicacion.aggregate(countPipeline)
        ]);

        const total = totalResult[0]?.total || 0;

        res.json({
            total,
            paginas: Math.ceil(total / parseInt(limit)),
            paginaActual: parseInt(page),
            resultados: publicaciones
        });

    } catch (error) {
        console.error('Error en buscarPublicaciones:', error);
        res.status(500).json({
            msg: 'Error al realizar la búsqueda',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @swagger
 * /api/publicaciones/usuario/con-recursos:
 *   get:
 *     summary: Obtiene publicaciones de un usuario específico con sus recursos
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario cuyas publicaciones se quieren obtener
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Publicado, Borrador, Eliminado]
 *           default: Publicado
 *         description: Filtro por estado de publicación
 *     responses:
 *       200:
 *         description: Lista de publicaciones del usuario con recursos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PublicacionConRecurso'
 *       400:
 *         description: Falta el parámetro usuarioId
 *       500:
 *         description: Error del servidor
 */
const obtenerPublicacionesUsuarioConRecursos = async (req, res = response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                msg: 'El parámetro usuarioId es requerido'
            });
        }

        const publicaciones = await Publicacion.aggregate([
            {
                $match: {
                    usuarioId: Number(id),
                    estado: "Publicado"
                }
            },
            {
                $lookup: {
                    from: "recursos",
                    localField: "identificador",
                    foreignField: "publicacionId",
                    as: "recurso"
                }
            },
            {
                $addFields: {
                    recurso: {
                        $cond: {
                            if: { $eq: [{ $size: "$recurso" }, 0] },
                            then: null,
                            else: { $arrayElemAt: ["$recurso", 0] }
                        }
                    }
                }
            }
        ]);

        return res.status(200).json(publicaciones);
    } catch (error) {
        console.error('Error al obtener publicaciones del usuario:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            error: error.message
        });
    }
};
/**
 * @swagger
 * /api/publicaciones/con-recursos:
 *   get:
 *     summary: Obtiene todas las publicaciones con sus recursos asociados (si existen)
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Publicado, Borrador, Eliminado]
 *           default: Publicado
 *         description: Filtro por estado de publicación
 *     responses:
 *       200:
 *         description: Lista de publicaciones con recursos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PublicacionConRecurso'
 *       500:
 *         description: Error del servidor
 */
const obtenerPublicacionesConRecursos = async (req, res = response) => {
    try {
        const publicaciones = await Publicacion.aggregate([
            {
                $match: { estado: "Publicado" }
            },
            {
                $lookup: {
                    from: "recursos",
                    localField: "identificador",
                    foreignField: "publicacionId",
                    as: "recurso"
                }
            },
            {
                $addFields: {
                    recurso: {
                        $cond: {
                            if: { $eq: [{ $size: "$recurso" }, 0] },
                            then: null, // Valor explícito para casos sin recursos
                            else: { $arrayElemAt: ["$recurso", 0] }
                        }
                    }
                }
            }
        ]);

        return res.status(200).json(publicaciones);
    } catch (error) {
        console.error('Error al obtener publicaciones con recursos:', error);
        return res.status(500).json({
            msg: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    crearPublicacion,
    eliminarPublicacionModerador,
    buscarPublicaciones,
    obtenerPublicacionesConRecursos,
    obtenerPublicacionesUsuarioConRecursos,
};
