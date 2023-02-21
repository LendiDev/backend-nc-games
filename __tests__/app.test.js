const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

const emptyReviewsTable = async () => {
  await db.query('TRUNCATE comments RESTART IDENTITY CASCADE;');
  await db.query('TRUNCATE reviews RESTART IDENTITY CASCADE;');
}

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

              expect(reviews).toBeSortedBy("created_at", { descending: true });
            });
        });

        test("200 - responds with an empty array of reviews objects if there is no reviews", async () => {
          await emptyReviewsTable();
          return request(app)
            .get("/api/reviews")
            .expect(200)
            .then(({ body }) => {
              const { reviews } = body;

              expect(reviews).toHaveLength(0);
            });
        });
      });
    });
  });

  describe("/api/reviews/:review_id", () => {
    describe("GET", () => {
      describe("Successful Responses", () => {
        test("200 - responds with a review object by review_id", () => {
          const reviewId = 1;
          return request(app)
            .get(`/api/reviews/${reviewId}`)
            .expect(200)
            .then(({ body }) => {
              const { review } = body;

              expect(review).toEqual(
                expect.objectContaining({
                  review_id: reviewId,
                  title: expect.any(String),
                  review_body: expect.any(String),
                  designer: expect.any(String),
                  review_img_url: expect.any(String),
                  votes: expect.any(Number),
                  category: expect.any(String),
                  owner: expect.any(String),
                  created_at: expect.any(String),
                })
              );
            });
        });
      });

      describe("Unsuccessful Responses", () => {
        test("400 - response with message 'Bad request' when wrong type passed in as review_id", () => {
          const reviewId = 'something-illegal';
          return request(app)
            .get(`/api/reviews/${reviewId}`)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe('Bad request');
            });
        });
        test("404 - response with message 'Review not found' when review_id doesn't exist", () => {
          const reviewId = 9999999;
          return request(app)
            .get(`/api/reviews/${reviewId}`)
            .expect(404)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe('Review not found');
            });
        });
      });
    });
  });

  describe("/api/reviews/:review_id/comments", () => {
    describe("GET", () => {
      describe("Successful Responses", () => {
        test("200 - responds with an array of comments for specific review_id and should be sorted by created_at in descending order (most recent comments)", () => {
          const reviewId = 2;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments`)
            .expect(200)
            .then(({ body }) => {
              const { comments } = body;

              comments.forEach((comment) => {
                expect(comment).toMatchObject({
                  comment_id: expect.any(Number),
                  votes: expect.any(Number),
                  created_at: expect.any(String),
                  author: expect.any(String),
                  body: expect.any(String),
                  review_id: reviewId,
                });
              });
              expect(comments).toHaveLength(3);
              expect(comments).toBeSortedBy("created_at", { descending: true });
            });
        });

        test("200 - responds with empty array of comments when review_id does exist but has no comments", () => {
          const reviewId = 1;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments`)
            .expect(200)
            .then(({ body }) => {
              const { comments } = body;
              expect(comments).toHaveLength(0);
            });
        });
      });
      describe("Unsuccessful Responses", () => {
        test("400 - responds with message 'Bad request' when wrong type of review_id passed in", () => {
          const reviewId = "two";
          return request(app)
            .get(`/api/reviews/${reviewId}/comments`)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });
        
        test("404 - responds with message 'Review not found' when review_id doesn't exist", () => {
          const reviewId = 99999999;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments`)
            .expect(404)
            .then(({ body }) => {
              const { message } = body;
              expect(message).toBe("Review not found");
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
