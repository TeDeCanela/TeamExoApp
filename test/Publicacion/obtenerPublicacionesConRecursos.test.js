const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/app");
const { Recurso, Foto } = require("../../src/modelos/Recurso");
const Publicacion = require("../../src/modelos/Publicacion");

process.env.NODE_ENV = 'test';

describe("GET /api/publicaciones/con-recursos - Obtener publicaciones con recursos", () => {

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test("Debe retornar una publicación con su recurso asociado", async () => {
        // Crear un recurso tipo Foto
        const recursoCreado = await Foto.create({
            identificador: 1,
            formato: 1,
            tamano: 2048,
            URL: "http://ejemplo.com/foto.jpg",
            usuarioId: 123,
            resolucion: 1080
        });

        // Crear una publicación asociada al recurso
        await Publicacion.create({
            identificador: 100,
            titulo: "Publicación de prueba",
            contenido: "Contenido de prueba",
            estado: "Publicado",
            usuarioId: 123,
            fechaCreacion: new Date(),
            recursoId: recursoCreado.identificador
        });

        // Hacer la petición para obtener publicaciones con recursos
        const res = await request(app)
            .get("/api/publicaciones/con-recursos")
            .query({ usuarioId: 123 });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        const publicacion = res.body[0];
        expect(publicacion.titulo).toBe("Publicación de prueba");
        expect(publicacion.recurso).toBeDefined();
        expect(publicacion.recurso.URL).toBe("http://ejemplo.com/foto.jpg");
        expect(publicacion.recurso.resolucion).toBe(1080);
        expect(publicacion.recurso.tipo).toBe("Foto");
    });

    test("Debe retornar publicaciones sin recurso cuando recursoId no está presente", async () => {
        await Publicacion.create({
            identificador: 101,
            titulo: "Publicación sin recurso",
            contenido: "Contenido sin recurso",
            estado: "Publicado",
            usuarioId: 999,
            fechaCreacion: new Date(),
        });

        const res = await request(app)
            .get("/api/publicaciones/con-recursos")
            .query({ usuarioId: 999 });

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].titulo).toBe("Publicación sin recurso");
        expect(res.body[0].recurso).toBe(null);
    });
});
