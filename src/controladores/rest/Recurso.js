const { response } = require('express');
const { Recurso, Foto, Video, Audio } = require('../../modelos/Recurso');
const logger = require('../../helpers/logger');

const obtenerRecursoPorId = async (req, res = response) => {
    try {
        const recurso = await Recurso.findOne({ identificador: parseInt(req.params.id) });
        if (!recurso) return res.status(404).json({ msg: 'Recurso no encontrado' });
        res.json(recurso);
    } catch (error) {
        logger.error(`Error al obtener recurso: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const obtenerRecursosPorUsuario = async (req, res = response) => {
    try {
        const recursos = await Recurso.find({ usuarioId: parseInt(req.params.usuarioId) });
        res.json(recursos);
    } catch (error) {
        logger.error(`Error al obtener recursos por usuario: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const obtenerRecursosPorTipo = async (req, res = response) => {
    try {
        const recursos = await Recurso.find({ tipo: req.params.tipo });
        res.json(recursos);
    } catch (error) {
        logger.error(`Error al obtener recursos por tipo: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const eliminarRecurso = async (req, res = response) => {
    try {
        const eliminado = await Recurso.findOneAndDelete({ identificador: parseInt(req.params.id) });
        if (!eliminado) return res.status(404).json({ msg: 'Recurso no encontrado' });
        res.json({ msg: 'Recurso eliminado', recurso: eliminado });
    } catch (error) {
        logger.error(`Error al eliminar recurso: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const actualizarRecurso = async (req, res = response) => {
    try {
        const { formato, tamano, resolucion, duracion } = req.body;
        const recursoExistente = await Recurso.findOne({ identificador: parseInt(req.params.id) });

        if (!recursoExistente) {
            return res.status(404).json({ msg: 'Recurso no encontrado' });
        }

        const tipo = recursoExistente.tipo;
        const datosActualizados = { formato, tamano };

        let Modelo;

        if (tipo === 'Foto' || tipo === 'Video') {
            datosActualizados.resolucion = resolucion;
            Modelo = tipo === 'Foto' ? Foto : Video;
        } else if (tipo === 'Audio') {
            datosActualizados.duracion = duracion;
            Modelo = Audio;
        } else {
            Modelo = Recurso; // fallback (por si acaso)
        }

        const actualizado = await Modelo.findOneAndUpdate(
            { identificador: parseInt(req.params.id) },
            datosActualizados,
            { new: true }
        );

        res.json({ msg: 'Recurso actualizado', recurso: actualizado });
    } catch (error) {
        logger.error(`Error al actualizar recurso: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const buscarRecursos = async (req, res = response) => {
    try {
        const query = req.query;
        const filtros = {};

        if (query.tipo) filtros.tipo = query.tipo;
        if (query.tamano) filtros.tamano = parseInt(query.tamano);
        if (query.formato) filtros.formato = parseInt(query.formato);
        if (query.usuarioId) filtros.usuarioId = parseInt(query.usuarioId);

        const resultados = await Recurso.find(filtros);
        res.json(resultados);
    } catch (error) {
        logger.error(`Error al buscar recursos: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

module.exports = {
    obtenerRecursoPorId,
    obtenerRecursosPorUsuario,
    obtenerRecursosPorTipo,
    eliminarRecurso,
    actualizarRecurso,
    buscarRecursos
};
