const { obtenerEstadisticas } = require('../../servicios/serviciosgRPC/grcpEstadistica/controladores/EstadisticaGRPC');
const grpc = require('@grpc/grpc-js');

/**
 * @swagger
 * /api/estadisticas:
 *   get:
 *     summary: Obtener estadísticas generales desde el servicio gRPC
 *     tags: [Estadísticas]
 *     description: Este endpoint llama internamente al servicio gRPC para recuperar estadísticas como publicaciones más vistas, usuarios más activos, etc.
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 usuariosActivos: 25
 *                 publicacionesPopulares:
 *                   - id: 1
 *                     titulo: "Canción A"
 *                     visitas: 150
 *                   - id: 2
 *                     titulo: "Video B"
 *                     visitas: 132
 *       500:
 *         description: Error al recuperar estadísticas desde gRPC
 */
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
