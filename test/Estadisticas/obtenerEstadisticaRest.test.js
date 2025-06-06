const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/app"); // Asegúrate de que sea la ruta correcta a tu app
const grpc = require("@grpc/grpc-js");

// Mockeamos la función gRPC
jest.mock("../../servicios/serviciosgRPC/grcpEstadistica/controladores/EstadisticaGRPC", () => ({
    obtenerEstadisticas: jest.fn()
}));

const { obtenerEstadisticas } = require("../../servicios/serviciosgRPC/grcpEstadistica/controladores/EstadisticaGRPC");

process.env.NODE_ENV = "test";

describe("GET /api/estadisticas - Obtener estadísticas desde gRPC", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test("Debería obtener las estadísticas correctamente", async () => {
        // Mock de la respuesta gRPC
        obtenerEstadisticas.mockImplementation((_, { callback }) => {
            callback(null, {
                topLikes: { publicacionId: 1, total: 10 },
                topComentarios: { publicacionId: 2, total: 5 }
            });
        });

        const res = await request(app).get("/api/estadisticas/estadistica");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            topLikes: { publicacionId: 1, total: 10 },
            topComentarios: { publicacionId: 2, total: 5 }
        });
    });

    test("Debería manejar errores correctamente", async () => {
        obtenerEstadisticas.mockImplementation((_, { callback }) => {
            callback({ code: grpc.status.INTERNAL, message: "Error en gRPC" });
        });

        const res = await request(app).get("/api/estadisticas/estadistica");

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty("error", "Error en gRPC");
    });
});
