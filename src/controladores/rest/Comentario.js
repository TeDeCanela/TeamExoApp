const { response } = require('express');
const Comentario = require('../../modelos/Comentario');
const logger = require('../../helpers/logger');

const crearComentario = async (req, res = response) => {
    const { comentarioId, publicacionId, usuarioId, texto } = req.body;
    try {
        const nuevo = new Comentario({ comentarioId, publicacionId, usuarioId, texto });
        await nuevo.save();
        res.status(201).json({ msg: 'Comentario creado', comentario: nuevo });
    } catch (error) {
        logger.error(`Error al crear comentario: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const obtenerComentariosPorPublicacion = async (req, res = response) => {
    try {
        const comentarios = await Comentario.find({ publicacionId: parseInt(req.params.id) });
        res.json(comentarios);
    } catch (error) {
        logger.error(`Error al obtener comentarios: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const actualizarComentario = async (req, res = response) => {
    try {
        const { texto } = req.body;
        const actualizado = await Comentario.findOneAndUpdate(
            { comentarioId: parseInt(req.params.comentarioId) },
            { texto },
            { new: true }
        );

        if (!actualizado) return res.status(404).json({ msg: 'Comentario no encontrado' });

        res.json({ msg: 'Comentario actualizado', comentario: actualizado });
    } catch (error) {
        logger.error(`Error al actualizar comentario: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const eliminarComentario = async (req, res = response) => {
    try {
        const eliminado = await Comentario.findOneAndDelete({ comentarioId: parseInt(req.params.comentarioId) });
        if (!eliminado) return res.status(404).json({ msg: 'Comentario no encontrado' });

        res.json({ msg: 'Comentario eliminado correctamente', comentario: eliminado });
    } catch (error) {
        logger.error(`Error al eliminar comentario: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

module.exports = {
    crearComentario,
    obtenerComentariosPorPublicacion,
    actualizarComentario,
    eliminarComentario
};
