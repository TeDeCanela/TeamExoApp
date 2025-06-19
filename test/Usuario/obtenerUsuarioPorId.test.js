const { obtenerUsuarioPorId } = require('../../src/controladores/Usuario');
const Usuario = require('../../src/modelos/Usuario');
const httpMocks = require('node-mocks-http');
process.env.NODE_ENV = 'test';

jest.mock('../../src/modelos/Usuario');

describe('obtenerUsuarioPorId', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería devolver 400 si no se proporciona ID', async () => {
        const req = httpMocks.createRequest({
            params: {}
        });
        const res = httpMocks.createResponse();

        await obtenerUsuarioPorId(req, res);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({
            ok: false,
            msg: 'Se requiere un ID de usuario válido'
        });
    });

    it('debería devolver 400 si el ID no es numérico', async () => {
        const req = httpMocks.createRequest({
            params: { id: 'abc' }
        });
        const res = httpMocks.createResponse();

        await obtenerUsuarioPorId(req, res);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({
            ok: false,
            msg: 'Se requiere un ID de usuario válido'
        });
    });

    it('debería devolver 404 si el usuario no existe', async () => {
        Usuario.findOne.mockResolvedValue(null);

        const req = httpMocks.createRequest({
            params: { id: '999' }
        });
        const res = httpMocks.createResponse();

        await obtenerUsuarioPorId(req, res);

        expect(Usuario.findOne).toHaveBeenCalledWith(
            { usuarioId: 999 },
            { contrasena: 0 }
        );
        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({
            ok: false,
            msg: 'Usuario no encontrado'
        });
    });

    it('debería devolver el usuario si existe', async () => {
        const mockUsuario = {
            usuarioId: 1,
            nombre: 'Test User',
            email: 'test@example.com'
        };
        Usuario.findOne.mockResolvedValue(mockUsuario);

        const req = httpMocks.createRequest({
            params: { id: '1' }
        });
        const res = httpMocks.createResponse();

        await obtenerUsuarioPorId(req, res);

        expect(Usuario.findOne).toHaveBeenCalledWith(
            { usuarioId: 1 },
            { contrasena: 0 }
        );
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual({
            ok: true,
            usuario: mockUsuario
        });
    });

});