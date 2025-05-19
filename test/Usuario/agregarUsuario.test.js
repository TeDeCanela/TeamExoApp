const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const app = require("../../src/app");
process.env.NODE_ENV = 'test';

describe("POST /api/usuarios - Agregar Usuario", () => {
    const correoPrueba = "nicoletest@email.com";

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test("Debería crear un nuevo usuario y hashear la contraseña", async () => {
        const res = await request(app)
            .post("/api/usuarios")
            .send({
                nombreUsuario: "nicotest",
                nombre: "Nicole",
                apellidos: "Oh",
                correo: correoPrueba,
                contrasena: "123456",
                rol: "Administrador"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.usuario).toBeDefined();
        expect(res.body.usuario.correo).toBe(correoPrueba);

        // Verifica que la contraseña no se guarde tal cual
        const contrasenaGuardada = res.body.usuario.contrasena;
        expect(contrasenaGuardada).not.toBe("123456");

        const esHashValido = await bcrypt.compare("123456", contrasenaGuardada);
        expect(esHashValido).toBe(true);
    });

    test("No debería permitir correo duplicado", async () => {
        const res = await request(app)
            .post("/api/usuarios")
            .send({
                nombreUsuario: "nicotest2",
                nombre: "Nicole",
                apellidos: "Oh",
                correo: correoPrueba,
                contrasena: "nueva",
                rol: "Administrador"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.msg).toMatch(/ya está registrado/i);
    });
});

