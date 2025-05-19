const { Recurso, Foto, Video, Audio } = require('../../modelos/Recurso');
const fs = require('fs');
const path = require('path');
const grpc = require('@grpc/grpc-js');

const crearRecurso = async (call, callback) => {
    const {
        tipo,
        identificador,
        formato,
        tamano,
        usuarioId,
        resolucion,
        duracion,
        archivo
    } = call.request;

    try {
        // 1. Validación básica
        if (!archivo || !archivo.length) {
            return callback(null, {
                exito: false,
                mensaje: 'No se recibió archivo para guardar'
            });
        }

        // 2. Crear carpeta si no existe
        const uploadsDir = path.join(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // 3. Generar nombre de archivo según tipo
        let extension = tipo === 'Foto' ? 'jpg' :
            tipo === 'Audio' ? 'mp3' :
                tipo === 'Video' ? 'mp4' : 'bin';

        const nombreArchivo = `recurso_${identificador}.${extension}`;
        const rutaArchivo = path.join(uploadsDir, nombreArchivo);

        // 4. Guardar archivo binario
        fs.writeFileSync(rutaArchivo, archivo);

        // 5. Construir URL local
        const url = `http://localhost:3000/uploads/${nombreArchivo}`;

        // 6. Crear recurso específico
        let recurso;

        switch (tipo) {
            case 'Foto':
                recurso = new Foto({
                    identificador,
                    formato,
                    tamano,
                    URL: url,
                    usuarioId,
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
                    duracion
                });
                break;
            default:
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
        console.error('Error al crear recurso:', error);
        return callback({
            code: grpc.status.INTERNAL,
            message: 'Error al guardar recurso'
        });
    }
};

module.exports = { crearRecurso };
