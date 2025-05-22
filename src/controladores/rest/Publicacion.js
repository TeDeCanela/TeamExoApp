const { response } = require('express');
const logger = require('../../helpers/logger');
const Publicacion = require('../../modelos/Publicacion');

const crearPublicacion = async (req, res = response) => {
    const { titulo, contenido, estado = 'Borrador', usuarioId = 1 } = req.body;

    if (!titulo || !contenido) {
        return res.status(400).json({ msg: 'Título y contenido son requeridos' });
    }

    try {
        // Crear primero para generar el ID autoincremental
        const count = await Publicacion.countDocuments();
        const nuevaPublicacion = new Publicacion({
            identificador: count + 1, // Generación manual para pruebas
            titulo,
            contenido,
            estado,
            usuarioId,
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
            error: error.message // Solo para desarrollo
        });
    }
};

const eliminarPublicacionModerador = async (req, res = response) => {
    const { identificador } = req.params;
    // Parámetros simplificados para pruebas
    const usuarioRol = req.body.rol || req.query.rol; // Ahora viene en el body/query

    try {
        // Verificar si el usuario es moderador/admin
        if(usuarioRol !== 'Moderador' && usuarioRol !== 'Administrador') {
            return res.status(403).json({
                msg: 'No tienes permisos para realizar esta acción'
            });
        }

        // Buscar la publicación
        const publicacion = await Publicacion.findOne({
            identificador: Number(identificador)
        });

        if (!publicacion) {
            return res.status(404).json({
                msg: 'Publicación no encontrada'
            });
        }

        // Cambiar el estado a "Eliminado"
        const publicacionEliminada = await Publicacion.findOneAndUpdate(
            { identificador: Number(identificador) },
            {
                estado: 'Eliminado',
                eliminadoPor: req.body.usuarioId || null, // Opcional
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

const buscarPublicaciones = async (req, res = response) => {
    const { query, categorias, estado = 'Publicado', limit = 10, page = 1 } = req.query;

    try {
        // Construir el filtro de búsqueda
        const filtro = {
            estado
        };

        // Si hay categorías, las añadimos al filtro
        if (categorias) {
            filtro.categorias = {
                $in: categorias.split(',')
            };
        }

        // Si hay palabras clave, buscamos en título, contenido y palabras clave
        if (query) {
            const regex = new RegExp(query, 'i'); // Búsqueda case insensitive
            filtro.$or = [
                { titulo: regex },
                { contenido: regex },
                { palabrasClave: { $in: [regex] } }
            ];
        }

        // Opciones de paginación
        const options = {
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            sort: { fechaCreacion: -1 } // Ordenar por más reciente primero
        };

        // Ejecutar la búsqueda
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

module.exports = {
    crearPublicacion,
    eliminarPublicacionModerador,
    buscarPublicaciones
};