const { response } = require('express');
const Reaccion = require('../../modelos/Reaccion');
const logger = require('../../helpers/logger');
const { emitirReaccion } = require('../grpc/ReaccionGRPC');

const crearReaccion = async (req, res = response) => {
    const { reaccionId, tipo, publicacionId, usuarioId, nombreUsuario } = req.body;

    try {
        const nueva = new Reaccion({ reaccionId, tipo, publicacionId, usuarioId });
        await nueva.save();

        emitirReaccion({ tipo, usuarioId, publicacionId, nombreUsuario });

        res.status(201).json({ msg: 'Reacción creada', reaccion: nueva });
    } catch (error) {
        logger.error(`Error al crear reacción: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const obtenerReaccionesPorPublicacion = async (req, res = response) => {
    try {
        const reacciones = await Reaccion.find({ publicacionId: parseInt(req.params.id) });
        res.json(reacciones);
    } catch (error) {
        logger.error(`Error al obtener reacciones: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const actualizarReaccion = async (req, res = response) => {
    try {
        const { tipo } = req.body;
        const actualizada = await Reaccion.findOneAndUpdate(
            { reaccionId: parseInt(req.params.reaccionId) },
            { tipo },
            { new: true }
        );

        if (!actualizada) return res.status(404).json({ msg: 'Reacción no encontrada' });
        res.json({ msg: 'Reacción actualizada', reaccion: actualizada });
    } catch (error) {
        logger.error(`Error al actualizar reacción: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const eliminarReaccion = async (req, res = response) => {
    try {
        const { reaccionId } = req.params;

        const eliminada = await Reaccion.findOneAndDelete({ reaccionId: parseInt(reaccionId) });

        if (!eliminada) {
            return res.status(404).json({ msg: 'Reacción no encontrada' });
        }

        res.json({
            msg: 'Reacción eliminada correctamente',
            reaccion: eliminada
        });
    } catch (error) {
        logger?.error(`Error al eliminar reacción: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

module.exports = {crearReaccion,obtenerReaccionesPorPublicacion, actualizarReaccion,eliminarReaccion };