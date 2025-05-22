process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test' });

const { startGrpcServer, stopGrpcServer } = require('../../servicios/serviciosgRPC/Recurso');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const mongoose = require('mongoose');

const { emitirReaccion } = require('../../src/controladores/grpc/ReaccionGRPC');

test('emitirReaccion ignora si faltan datos', () => {
    const consola = jest.spyOn(console, 'warn').mockImplementation(() => {});
    emitirReaccion({ tipo: 'like', usuarioId: null, publicacionId: 5 });
    expect(consola).toHaveBeenCalledWith(expect.stringContaining('faltan datos'));
    consola.mockRestore();
});

test('emitirReaccion llama stream.write si hay suscriptores', () => {
    const streamMock = { write: jest.fn(), cancelled: false };
    const { __setSuscriptores, emitirReaccion } = require('../../src/controladores/grpc/ReaccionGRPC');

    // Set manually (debes exponer esto si no lo haces ya)
    __setSuscriptores({
        10: [streamMock]
    });

    emitirReaccion({
        tipo: 'like',
        usuarioId: 1,
        publicacionId: 10,
        nombreUsuario: 'Nico'
    });

    expect(streamMock.write).toHaveBeenCalledWith({
        tipo: 'like',
        usuarioId: 1,
        publicacionId: 10,
        nombreUsuario: 'Nico'
    });
});
