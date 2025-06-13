const { getUsuarios } = require('../../src/controladores/Usuario');
const Usuario = require('../../src/modelos/Usuario');
const httpMocks = require('node-mocks-http');
process.env.NODE_ENV = 'test';

jest.mock('../../src/modelos/Usuario');

describe('getUsuarios', () => {
    it('debería devolver usuarios en JSON si no hay errores', async () => {
        const mockUsuarios = [
            { nombreUsuario: 'nico123', nombre: 'Nicole' },
            { nombreUsuario: 'juana456', nombre: 'Juana' }
        ];
        Usuario.find.mockResolvedValue(mockUsuarios);

        const req = httpMocks.createRequest();
        const res = httpMocks.createResponse();
        res.json = jest.fn();

        await getUsuarios(req, res);

        expect(Usuario.find).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(mockUsuarios);
    });

    it('debería devolver error 500 si hay excepción', async () => {
        Usuario.find.mockRejectedValue(new Error('Error de DB'));

        const req = httpMocks.createRequest();
        const res = httpMocks.createResponse();
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();

        await getUsuarios(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            msg: 'Ha habido un error en el servidor, porfavor intente más tarde o contacte con el administrador'
        });
    });
});
