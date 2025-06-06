const { obtenerEstadisticas } = require('../../servicios/serviciosgRPC/grcpEstadistica/controladores/EstadisticaGRPC');
const Reaccion = require('../../src/modelos/Reaccion');
const Comentario = require('../../src/modelos/Comentario');
const Estadistica = require('../../src/modelos/Estadistica');

jest.mock('../../src/modelos/Reaccion');
jest.mock('../../src/modelos/Comentario');
jest.mock('../../src/modelos/Estadistica');

describe('obtenerEstadisticas', () => {
    it('debería devolver estadísticas correctamente', async () => {
        Reaccion.aggregate.mockResolvedValue([{ _id: 123, total: 10 }]);
        Comentario.aggregate.mockResolvedValue([{ _id: 456, total: 5 }]);
        Estadistica.findOneAndUpdate.mockResolvedValue();

        const callback = jest.fn();

        await obtenerEstadisticas({}, callback);

        expect(callback).toHaveBeenCalledWith(null, {
            topLikes: { publicacionId: 123, total: 10 },
            topComentarios: { publicacionId: 456, total: 5 },
        });

        expect(Estadistica.findOneAndUpdate).toHaveBeenCalledTimes(2);
    });
});
