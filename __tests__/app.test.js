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

  describe("/api/reviews", () => {
    describe("GET", () => {
      describe("Successful Responses", () => {
        test("200 - responds with an array of reviews objects including comment_count in descending order by created_at", () => {
          return request(app)
            .get("/api/reviews")
            .expect(200)
            .then(({ body }) => {
              const { reviews } = body;

              reviews.forEach((review) => {
                expect(review).toHaveProperty("owner", expect.any(String));
                expect(review).toHaveProperty("title", expect.any(String));
                expect(review).toHaveProperty("review_id", expect.any(Number));
                expect(review).toHaveProperty("category", expect.any(String));
                expect(review).toHaveProperty(
                  "review_img_url",
                  expect.any(String)
                );
                expect(review).toHaveProperty("created_at", expect.any(String));
                expect(review).toHaveProperty("votes", expect.any(Number));
                expect(review).toHaveProperty("designer", expect.any(String));
                expect(review).toHaveProperty(
                  "comment_count",
                  expect.any(Number)
                );
              });
              expect(reviews).toHaveLength(13);

              const reviewsCommentsTotalCount = eval(
                reviews.map((review) => review.comment_count).join("+")
              );
              expect(reviewsCommentsTotalCount).toBe(6);

              expect(reviews).toBeSorted("created_at", { descending: true });
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
