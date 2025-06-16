const { Recurso, Foto, Video, Audio } = require('../../../../src/modelos/Recurso');
const fs = require('fs');
const path = require('path');
const grpc = require('@grpc/grpc-js');
require('dotenv').config();

const crearRecurso = async (call, callback) => {
    const {
        tipo,
        identificador,
        formato,
        tamano,
        usuarioId,
        publicacionId,
        resolucion,
        duracion,
        archivo
    } = call.request;

    try {

        if (!archivo || !archivo.length) {
            return callback(null, {
                exito: false,
                mensaje: 'No se recibió archivo para guardar'
            });
        }

        const uploadsDir = path.resolve(__dirname, '../../../../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        let extension = tipo === 'Foto' ? 'jpg' :
            tipo === 'Audio' ? 'mp3' :
                tipo === 'Video' ? 'mp4' : 'bin';

        const nombreArchivo = `recurso_${identificador}.${extension}`;
        const rutaArchivo = path.join(uploadsDir, nombreArchivo);
        fs.writeFileSync(rutaArchivo, archivo);
        if (!fs.existsSync(rutaArchivo)) {
            return callback(null, {
                exito: false,
                mensaje: 'Error al guardar el archivo en disco'
            });
        }

        const HOST_BASE = process.env.PUBLIC_HOST || 'http://localhost:3000';
        const url = `${HOST_BASE}/uploads/${nombreArchivo}`;

        let recurso;

        switch (tipo) {
            case 'Foto':
                recurso = new Foto({
                    identificador,
                    formato,
                    tamano,
                    URL: url,
                    usuarioId,
                    publicacionId,
                    resolucion
                });
                break;
            case 'Video':
                recurso = new Video({
                    identificador,
                    formato,
                    tamano,
                    URL: url,
                    usuarioId,
                    publicacionId,
                    resolucion
                });
                break;
            case 'Audio':
                recurso = new Audio({
                    identificador,
                    formato,
                    tamano,
                    URL: url,
                    usuarioId,
                    publicacionId,
                    duracion
                });
                break;
                return callback(null, {
                    exito: false,
                    mensaje: 'Tipo de recurso no válido'
                });
        }

        await recurso.save();

        return callback(null, {
            exito: true,
            mensaje: 'Recurso creado exitosamente'
        });

    } catch (error) {
        return callback({
            code: grpc.status.INTERNAL,
            message: 'Error al guardar recurso'
        });
    }
};

const descargarRecurso = async (call, callback) => {
    const { identificador, tipo } = call.request;

    try {
        let extension = tipo === 'Foto' ? 'jpg' :
            tipo === 'Audio' ? 'mp3' :
                tipo === 'Video' ? 'mp4' : 'bin';

        const nombreArchivo = `recurso_${identificador}.${extension}`;
        const uploadsDir = path.resolve(__dirname, '../../../../uploads');
        const rutaArchivo = path.join(uploadsDir, nombreArchivo);
        ;

        console.log("Buscando archivo en:", rutaArchivo);

        if (!fs.existsSync(rutaArchivo)) {
            return callback(null, {
                exito: false,
                mensaje: 'El recurso no existe'
            });
        }

        const archivo = fs.readFileSync(rutaArchivo);

        return callback(null, {
            exito: true,
            mensaje: 'Recurso descargado exitosamente',
            archivo
        });
    } catch (error) {
        return callback({
            code: grpc.status.INTERNAL,
            message: 'Error al descargar recurso'
        });
    }
};

module.exports = { crearRecurso, descargarRecurso };
