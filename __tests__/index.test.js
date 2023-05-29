const request = require("supertest");
const app = require("../index");

describe("GET /index", () => {
    test("Index responds", async () => {
        const response = await request(app).get("/");
        expect(response.status).toBe(200);
    });
});
