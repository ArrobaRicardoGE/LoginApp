const request = require("supertest");
const app = require("../index");

describe("Log in", () => {
    test("Login page responds", async () => {
        const response = await request(app).get("/login");
        expect(response.status).toBe(200);
    });
    test("Succesful auth works", async () => {
        const response = await request(app)
            .post("/auth")
            .send({ username: "test", password: "test" });
        expect(response.text).toBe("Found. Redirecting to /");
    });
    test("Unsuccesful auth works", async () => {
        const response = await request(app)
            .post("/auth")
            .send({ username: "test", password: "tests" });
        expect(response.text).toBe(
            "Found. Redirecting to /login?success=false"
        );
    });
});
