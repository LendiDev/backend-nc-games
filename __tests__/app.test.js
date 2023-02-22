const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

const emptyReviewsTable = () => {
  db.query("TRUNCATE reviews RESTART IDENTITY CASCADE;");
};

const emptyUsersTable = () => {
  db.query("TRUNCATE users RESTART IDENTITY CASCADE;");
};

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

  const expectedReviewShape = {
    owner: expect.any(String),
    title: expect.any(String),
    review_id: expect.any(Number),
    category: expect.any(String),
    review_img_url: expect.any(String),
    created_at: expect.any(String),
    review_body: expect.any(String),
    designer: expect.any(String),
    votes: expect.any(Number),
  };

  describe("/api/reviews", () => {
    describe("GET", () => {
      describe("Successful Responses", () => {
        test("200 - responds with an array of reviews objects including comment_count in descending order by created_at", () => {
          return request(app)
            .get("/api/reviews")
            .expect(200)
            .then(({ body }) => {
              const { reviews } = body;

              const reviewsCommentsTotalCount = eval(
                reviews.map((review) => review.comment_count).join("+")
              );

              reviews.forEach((review) => {
                expect(review).toEqual(
                  expect.objectContaining(expectedReviewShape)
                );
              });

              expect(reviews).toHaveLength(13);
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

    const reviewsSortByWhitelist = [
      "owner",
      "title",
      "category",
      "created_at",
      "votes",
      "designer",
      "comment_count",
    ];
    const reviewsOrderWhitelist = ["ASC", "DESC"];
    const reviewsCategories = [
      { slug: "euro game", expectedLength: 1 },
      { slug: "social deduction", expectedLength: 11 },
    ];

    describe("GET ?category=...", () => {
      describe("Successful Responses", () => {
        test("200 - responds with an array of reviews objects based on category value and should be in descending (default) order by created_at (default)", () => {
          return request(app)
            .get("/api/reviews?category=euro game")
            .expect(200)
            .then(({ body: { reviews } }) => {
              const reviewsCommentsTotalCount = eval(
                reviews.map((review) => review.comment_count).join("+")
              );
              reviews.forEach((review) => {
                expect(review).toEqual(
                  expect.objectContaining({
                    ...expectedReviewShape,
                    category: "euro game",
                  })
                );
              });
              expect(reviews).toHaveLength(1);
              expect(reviewsCommentsTotalCount).toBe(0);
              expect(reviews).toBeSortedBy("created_at", { descending: true });
            });
        });

        test("200 - responds with an empty array of reviews when there is no reviews in a category", () => {
          return request(app)
            .get("/api/reviews?category=children's games")
            .expect(200)
            .then(({ body: { reviews } }) => {
              expect(reviews).toHaveLength(0);
            });
        });
      });
      describe("Unsuccessful Responses", () => {
        test("404 - responds with error message when specified category doesn't exist", () => {
          return request(app)
            .get("/api/reviews?category=non existent category")
            .expect(404)
            .then(({ body: { message } }) => {
              expect(message).toBe("Category not found");
            });
        });
      });
    });

    describe("GET ?category=...$order=...", () => {
      describe("Successful Responses", () => {
        test("200 - responds with an array of reviews objects based on category value and should be in ascending order by created_at (default)", () => {
          return request(app)
            .get("/api/reviews/?category=social deduction&order=ASC")
            .expect(200)
            .then(({ body: { reviews } }) => {
              reviews.forEach((review) => {
                expect(review).toEqual(
                  expect.objectContaining({
                    ...expectedReviewShape,
                    category: "social deduction",
                  })
                );
              });

              expect(reviews).toHaveLength(11);
              expect(reviews).toBeSortedBy("created_at");
            });
        });
      });
    });

    describe("GET ?sort_by=...", () => {
      describe("Successful Responses", () => {
        reviewsSortByWhitelist.forEach((sortBy) => {
          test(`200 - responds with an array of all reviews objects and should be sorted by ${sortBy} in DESC (default) order`, () => {
            return request(app)
              .get(`/api/reviews?sort_by=${sortBy}`)
              .expect(200)
              .then(({ body: { reviews } }) => {
                reviews.forEach((review) => {
                  expect(review).toEqual(
                    expect.objectContaining({
                      ...expectedReviewShape,
                    })
                  );
                });

                expect(reviews.length).toBeGreaterThan(0);
                expect(reviews).toBeSortedBy(sortBy, {
                  descending: true,
                });
              });
          });
        });
      });
      describe("Unsuccessful Responses", () => {
        test("400 - response with custom message 'Reviews cannot be sorted by '...'' when not permitted sort_by query value requested", () => {
          return request(app)
            .get(`/api/reviews?sort_by=author`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe("Reviews cannot be sorted by 'author'");
            });
        });
      });
    });
    describe("GET ?order=...", () => {
      describe("Successful Responses", () => {
        reviewsOrderWhitelist.forEach((order) => {
          test(`200 - responds with an array of all reviews objects and should be sorted by created_at (default) in ${order} order`, () => {
            return request(app)
              .get(`/api/reviews?order=${order}`)
              .expect(200)
              .then(({ body: { reviews } }) => {
                expect(reviews.length).toBeGreaterThan(0);
                expect(reviews).toBeSortedBy("created_at", {
                  descending: order === "DESC" && true,
                });
              });
          });
        });
      });
      describe("Unsuccessful Responses", () => {
        test("400 - response with custom message 'Wrong query parameter of 'order'. ASC or DESC are only permitted' when not permitted order query value requested", () => {
          return request(app)
            .get(`/api/reviews?order=descending`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                "Wrong query parameter of 'order'. ASC or DESC are only permitted"
              );
            });
        });
      });
    });

    describe("GET ?sort_by=...&order=...", () => {
      describe("Successful Responses", () => {
        reviewsOrderWhitelist.forEach((order) => {
          reviewsSortByWhitelist.forEach((sortBy) => {
            test(`200 - responds with an array of all reviews objects and should be sorted by ${sortBy} in ${order} order`, () => {
              return request(app)
                .get(`/api/reviews?sort_by=${sortBy}&order=${order}`)
                .expect(200)
                .then(({ body: { reviews } }) => {
                  expect(reviews.length).toBeGreaterThan(0);
                  expect(reviews).toBeSortedBy(sortBy, {
                    descending: order === "DESC" && true,
                  });
                });
            });
          });
        });
      });
      describe("Successful Responses", () => {
        test("400 - response with custom message 'Reviews cannot be sorted by '...'' when not permitted order query value requested and category not specified", () => {
          return request(app)
            .get(`/api/reviews?sort_by=author&order=ASC`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe("Reviews cannot be sorted by 'author'");
            });
        });
      });
    });

    describe("GET ?category=...sort_by=...&order=...", () => {
      describe("Successful Responses", () => {
        reviewsCategories.forEach(({ slug, expectedLength }) => {
          reviewsOrderWhitelist.forEach((order) => {
            reviewsSortByWhitelist.forEach((sortBy) => {
              test(`200 - responds with an array of all reviews objects based on category '${slug}' and should be sorted by ${sortBy} in ${order} order`, () => {
                return request(app)
                  .get(
                    `/api/reviews?category=${slug}&sort_by=${sortBy}&order=${order}`
                  )
                  .expect(200)
                  .then(({ body }) => {
                    const { reviews } = body;

                    reviews.forEach((review) => {
                      expect(review).toEqual(
                        expect.objectContaining({
                          ...expectedReviewShape,
                          category: slug,
                        })
                      );
                    });
                    expect(reviews).toHaveLength(expectedLength);
                    expect(reviews).toBeSortedBy(sortBy, {
                      descending: order === "DESC" && true,
                    });
                  });
              });
            });
          });
        });
      });
      describe("Unsuccessful Responses", () => {
        test("400 - response with custom message 'Wrong query parameter of 'order'. ASC or DESC are only permitted' when not permitted order query value requested and category is valid", () => {
          return request(app)
            .get(`/api/reviews?category=dexterity&order=ASCC`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                "Wrong query parameter of 'order'. ASC or DESC are only permitted"
              );
            });
        });
        test("400 - response with custom message 'Reviews cannot be sorted by '...'' when not permitted order query value requested and category does exist, and valid order query value requested", () => {
          return request(app)
            .get(`/api/reviews?category=dexterity&sort_by=author&order=ASC`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe("Reviews cannot be sorted by 'author'");
            });
        });
        test("404 - response with error message 'Category not found' when not permitted order query value requested and category does not exist, and valid order query value requested", () => {
          return request(app)
            .get(`/api/reviews?category=superset&sort_by=author&order=ASC`)
            .expect(404)
            .then(({ body: { message } }) => {
              expect(message).toBe("Category not found");
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
                expect.objectContaining(expectedReviewShape)
              );
            });
        });
      });

      describe("Unsuccessful Responses", () => {
        test("400 - response with message 'Bad request' when wrong type passed in as review_id", () => {
          const reviewId = "something-illegal";
          return request(app)
            .get(`/api/reviews/${reviewId}`)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });
        test("404 - response with message 'Review not found' when review_id doesn't exist", () => {
          const reviewId = 9999999;
          return request(app)
            .get(`/api/reviews/${reviewId}`)
            .expect(404)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Review not found");
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

    describe("POST", () => {
      describe("Successful Responses", () => {
        test("201 - responds with posted comment", () => {
          const reviewId = 1;
          const commentToPost = {
            username: "mallionaire",
            body: "Amazing board game!",
          };
          return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(commentToPost)
            .expect(201)
            .then(({ body }) => {
              const { comment } = body;

              expect(comment).toMatchObject({
                comment_id: 7,
                votes: 0,
                created_at: expect.any(String),
                author: commentToPost.username,
                body: commentToPost.body,
                review_id: reviewId,
              });
            });
        });
      });
      describe("Unsuccessful Responses", () => {
        test("400 - responds with message 'Bad request' when malformed body", () => {
          const reviewId = 1;
          return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send("")
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });

        test("400 - responds with message 'Bad request' when missing all required fields", () => {
          const reviewId = 1;
          return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send("")
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });

        test("400 - responds with message 'Bad request' when missing username field", () => {
          const reviewId = 1;
          const comment = {
            body: "Amazing board game!",
          };
          return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });

        test("400 - responds with message 'Bad request' when missing body field", () => {
          const reviewId = 1;
          const comment = {
            username: "mallionaire",
          };
          return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });

        test("400 - responds with message 'Bad request' when user doesn't exist", () => {
          const reviewId = 1;
          const comment = {
            username: "mallionaire2222",
            body: "Amazing board game!",
          };
          return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });

        test("400 - responds with message 'Bad request' when review doesn't exist", () => {
          const reviewId = 999999999;
          const comment = {
            username: "mallionaire2222",
            body: "Amazing board game!",
          };
          return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });

        test("400 - responds with message 'Bad request' when review _id is wrong type", () => {
          const reviewId = "okokokok";
          const comment = {
            username: "mallionaire2222",
            body: "Amazing board game!",
          };
          return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });

        test("400 - responds with message 'Comment cannot be empty' when body field is empty", () => {
          const reviewId = 1;
          const comment = {
            username: "mallionaire",
            body: "",
          };
          return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Comment cannot be empty");
            });
        });
      });
    });
  });

  describe("/api/users", () => {
    describe("GET", () => {
      describe("Successful Responses", () => {
        test("200 - responds with an array of users", () => {
          return request(app)
            .get("/api/users")
            .expect(200)
            .then(({ body }) => {
              const { users } = body;

              users.forEach((user) => {
                expect(user).toHaveProperty("username", expect.any(String));
                expect(user).toHaveProperty("name", expect.any(String));
                expect(user).toHaveProperty("avatar_url", expect.any(String));
              });

              expect(users).toHaveLength(4);
            });
        });

        test("200 - responds with an empty array of reviews objects if there is no reviews", () => {
          emptyUsersTable();
          return request(app)
            .get("/api/users")
            .expect(200)
            .then(({ body }) => {
              const { users } = body;

              expect(users).toHaveLength(0);
            });
        });
      });
    });
  });

  describe.skip("/comments/:comment_id", () => {
    describe("DELETE", () => {
      describe("Successful Responses", () => {
        test("204 - responds with no content on successful deletion", () => {
          const commentId = 1;
          return request(app)
            .delete(`/comments/${commentId}`)
            .expect(404)
            .then(({ body }) => {
              expect(body).toHaveLength(0);
            });
        });
      });
      describe("Unsuccessful Responses", () => {
        test("404 - responds with error message 'Comment not found' when valid comment_id passed in but non-existent comment", () => {
          const commentId = 999999999;
          return request(app)
            .delete(`/comments/${commentId}`)
            .expect(404)
            .then(({ body: {message} }) => {
              expect(message).toBe('Comment not found');
            });
        });

        test("400 - responds with error message 'Bad request' when invalid comment_id passed in", () => {
          const commentId = 'first one';
          return request(app)
            .delete(`/comments/${commentId}`)
            .expect(400)
            .then(({ body: {message} }) => {
              expect(message).toBe('Bad request');
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
