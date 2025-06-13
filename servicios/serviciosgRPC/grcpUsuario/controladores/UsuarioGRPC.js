const Usuario = require('../../../../src/modelos/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../../../src/config');

const login = async (call, callback) => {
    const { correo, contrasena } = call.request;

    try {
        const usuario = await Usuario.findOne({ correo: correo.toLowerCase() });

        if (!usuario) {
            return callback(null, {
                exito: false,
                mensaje: 'Correo no encontrado',
                nombreUsuario: '',
                token: '',
                rol: '',
                usuarioId: 0
            });
        }

        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!contrasenaValida) {
            return callback(null, {
                exito: false,
                mensaje: 'Contraseña incorrecta',
                nombreUsuario: '',
                token: '',
                rol: '',
                usuarioId: 0
            });
        }

        const token = jwt.sign(
            { id: usuario.usuarioId, correo: usuario.correo, rol: usuario.rol },
            JWT_SECRET || 'secreto',
            { expiresIn: '1h' }
        );

        return callback(null, {
            exito: true,
            mensaje: 'Login exitoso',
            nombreUsuario: usuario.nombreUsuario,
            token,
            rol: usuario.rol,
            usuarioId: usuario.usuarioId
        });

    } catch (error) {
        return callback({
            code: grpc.status.INTERNAL,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = { login };