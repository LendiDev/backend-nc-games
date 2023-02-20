const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("app", () => {
  describe("/api/categories", () => {
    describe("GET", () => {
      describe("Successful Responses", () => {
        test("200 - responds with an array of category objects with a key 'categories'", () => {
          return request(app)
            .get("/api/categories")
            .expect(200)
            .then(({ body }) => {
              const { categories } = body;

              categories.forEach((category) => {
                expect(category).toHaveProperty("slug", expect.any(String));
                expect(category).toHaveProperty(
                  "description",
                  expect.any(String)
                );
              });
              expect(categories).toHaveLength(4);
            });
        });
      });
    });
  });
  describe("/api/non-existent-endpoint", () => {
    describe("GET", () => {
      test("404 - should response with 'Not Found' message", () => {
        return request(app)
          .get("/api/non-existent-endpoint")
          .expect(404)
          .then(({ body }) => {
            expect(body).toHaveProperty("message", "Not Found");
          });
      });
    });
  });
});
