process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test' });

const mockSave = jest.fn().mockResolvedValue(true);
const MockNotificacion = jest.fn().mockImplementation((data) => {
    return {
        ...data,
        save: mockSave
    };
});

jest.mock('../../src/modelos/Notificacion', () => {
    return MockNotificacion;
});

const { emitirNotificacion, __setSuscriptores } = require('../../servicios/serviciosgRPC/grcpNotificacion/controladores/NotificacionGRPC');

describe('Pruebas de Notificación gRPC', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        __setSuscriptores({});
        MockNotificacion.mockClear();
        mockSave.mockClear();
    });

    test('emitirNotificacion guarda en MongoDB', async () => {
        const testData = {
            usuarioId: 1,
            tipo: 'comentario',
            mensaje: 'Test',
            datosAdicionales: { postId: 123 }
        };

        await emitirNotificacion(testData);

        expect(MockNotificacion).toHaveBeenCalled();

        const args = MockNotificacion.mock.calls[0][0];
        expect(args).toEqual(expect.objectContaining({
            usuarioId: 1,
            tipo: 'comentario',
            mensaje: 'Test',
            datosAdicionales: { postId: 123 }
        }));

        expect(mockSave).toHaveBeenCalled();
    });
});
