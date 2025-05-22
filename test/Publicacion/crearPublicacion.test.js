    const request = require("supertest");
    const mongoose = require("mongoose");
    const app = require("../../src/app");
    const Publicacion = require("../../src/modelos/Publicacion");

    process.env.NODE_ENV = 'test';

    describe("POST /api/publicaciones - Crear Publicación (sin JWT)", () => {
        beforeAll(async () => {
            await mongoose.connect(process.env.MONGO_URI);
        });

        afterAll(async () => {
            await mongoose.connection.db.dropDatabase();
            await mongoose.connection.close();
        });

        test("Debería crear una nueva publicación sin autenticación", async () => {
            const res = await request(app)
                .post("/api/publicaciones")
                .send({
                    titulo: "Publicación de prueba",
                    contenido: "Contenido de prueba",
                    usuarioId: 1 // Simulamos usuario
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.publicacion).toBeDefined();
            expect(res.body.publicacion.usuarioId).toBe(1);
        });

        test("Debería fallar si falta el título", async () => {
            const res = await request(app)
                .post("/api/publicaciones")
                .send({
                    contenido: "Contenido sin título",
                    usuarioId: 1
                });

            expect(res.statusCode).toBe(400);
        });

        test("Debería asignar estado 'Borrador' por defecto", async () => {
            const res = await request(app)
                .post("/api/publicaciones")
                .send({
                    titulo: "Publicación con estado por defecto",
                    contenido: "Verificando estado predeterminado",
                    usuarioId: 1
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.publicacion.estado).toBe("Borrador");
        });
    });