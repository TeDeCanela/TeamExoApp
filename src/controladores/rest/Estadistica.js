const { obtenerEstadisticas } = require('../grpc/EstadisticaGRPC');
const grpc = require('@grpc/grpc-js');

async function obtenerEstadisticasREST(req, res) {
    obtenerEstadisticas({}, {
        callback: (err, response) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(response);
        }
    });
}

module.exports = {
    obtenerEstadisticasREST
};