const request = require("supertest");
const app = require("../index");

describe("Sign up", () => {
    test("Signup page responds", async () => {
        const response = await request(app).get("/signup");
        expect(response.status).toBe(200);
    });
});
