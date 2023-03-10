const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

const emptyReviewsTable = async () => {
  await db.query("TRUNCATE reviews RESTART IDENTITY CASCADE;");
};

const emptyUsersTable = async () => {
  await db.query("TRUNCATE users RESTART IDENTITY CASCADE;");
};

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("app", () => {
  describe("/api", () => {
    describe("GET", () => {
      describe("Successful Responses", () => {
        test("200 - responds with API endpoints in JSON format", () => {
          return request(app)
            .get("/api")
            .expect(200)
            .then(({ body, header }) => {
              expect(typeof body).toBe("object");
              expect(header["content-type"]).toBe(
                "application/json; charset=utf-8"
              );

              const endpoints = Object.entries(body);
              expect(endpoints.length).toBeGreaterThan(0);

              endpoints.forEach(([value, object]) => {
                expect(typeof value).toBe("string");
                expect(typeof object).toBe("object");

                expect(object).toEqual(
                  expect.objectContaining({
                    description: expect.any(String),
                    queries: expect.any(Array),
                    onSuccessStatusCode: expect.any(Number),
                  })
                );
              });
            });
        });
      });
    });
  });

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
    comment_count: expect.any(Number),
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

              expect(reviews).toHaveLength(10);
              expect(reviewsCommentsTotalCount).toBe(6);
              expect(reviews).toBeSortedBy("created_at", {
                descending: true,
                coerce: true,
              });
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

        test("200 - responds with empty reviews array when p is out of range", () => {
          return request(app)
            .get(`/api/reviews?p=100&limit=10`)
            .expect(200)
            .then(({ body: { max_pages, total_count, reviews } }) => {
              expect(reviews).toHaveLength(0);
              expect(total_count).toBe(13);
              expect(max_pages).toBe(2);
            });
        });

        test("200 - responds with an array of reviews objects if page is 2 and limit 10", async () => {
          return request(app)
            .get("/api/reviews?p=2&limit=10")
            .expect(200)
            .then(({ body: { max_pages, total_count, reviews } }) => {
              reviews.forEach((review) => {
                expect(review).toEqual(
                  expect.objectContaining(expectedReviewShape)
                );
              });
              expect(total_count).toBe(13);
              expect(reviews).toHaveLength(3);
              expect(max_pages).toBe(2);
            });
        });

        test("200 - responds with an array of reviews objects if limit is set to only 10", async () => {
          return request(app)
            .get("/api/reviews?limit=10")
            .expect(200)
            .then(({ body: { total_count, reviews } }) => {
              reviews.forEach((review) => {
                expect(review).toEqual(
                  expect.objectContaining(expectedReviewShape)
                );
              });
              expect(total_count).toBe(13);
              expect(reviews).toHaveLength(10);
            });
        });
        test("200 - responds with an filtered array by category of reviews objects and in ASC order by title if limit is set to 5 and page is 1", async () => {
          return request(app)
            .get(
              "/api/reviews?category=social deduction&sort_by=title&order=ASC&p=1&limit=5"
            )
            .expect(200)
            .then(({ body: { total_count, reviews } }) => {
              reviews.forEach((review) => {
                expect(review).toEqual(
                  expect.objectContaining({
                    ...expectedReviewShape,
                    category: "social deduction",
                  })
                );
              });
              expect(reviews).toBeSortedBy("title", { coerce: true });
              expect(total_count).toBe(11);
              expect(reviews).toHaveLength(5);
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
      { slug: "social deduction", expectedLength: 10 },
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
              expect(reviews).toBeSortedBy("created_at", {
                descending: true,
                coerce: true,
              });
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
              expect(message).toBe(
                `Category with slug 'non existent category' not found`
              );
            });
        });
      });
    });

    describe("GET ?category=...&order=...", () => {
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

              expect(reviews).toHaveLength(10);
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
                  coerce: true,
                });
              });
          });
        });
      });
      describe("Unsuccessful Responses", () => {
        test("400 - responds with custom error message 'Reviews cannot be sorted by '...'' when not permitted sort_by query value requested", () => {
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
                  coerce: true,
                });
              });
          });
        });
      });
      describe("Unsuccessful Responses", () => {
        test("400 - responds with custom error message 'Invalid query value of 'order' parameter. ASC or DESC are only permitted' when not permitted order query value requested", () => {
          return request(app)
            .get(`/api/reviews?order=descending`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                "Invalid query value of 'order' parameter. ASC or DESC are only permitted"
              );
            });
        });
      });
    });

    describe("GET ?sort_by=...&order=...", () => {
      describe("Successful Responses", () => {
        reviewsOrderWhitelist.forEach((order) => {
          reviewsSortByWhitelist.forEach((sortBy) => {
            test(`200 - responds with an array of all reviews objects and should be sorted by ${sortBy} in ${order} order`, async () => {
              return await request(app)
                .get(`/api/reviews?sort_by=${sortBy}&order=${order}`)
                .expect(200)
                .then(({ body: { reviews } }) => {
                  expect(reviews.length).toBeGreaterThan(0);
                  expect(reviews).toBeSortedBy(sortBy, {
                    descending: order === "DESC" && true,
                    coerce: true,
                  });
                });
            });
          });
        });
      });
      describe("Successful Responses", () => {
        test("400 - responds with custom error message 'Reviews cannot be sorted by '...'' when not permitted order query value requested and category not specified", () => {
          return request(app)
            .get(`/api/reviews?sort_by=author&order=ASC`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe("Reviews cannot be sorted by 'author'");
            });
        });
      });
    });

    describe("GET ?category=...&sort_by=...&order=...", () => {
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
                      coerce: true,
                    });
                  });
              });
            });
          });
        });
      });
      describe("Unsuccessful Responses", () => {
        test("400 - responds with custom error message 'Invalid query value of 'order' parameter. ASC or DESC are only permitted' when not permitted order query value requested and category is valid", () => {
          return request(app)
            .get(`/api/reviews?category=dexterity&order=ASCC`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                "Invalid query value of 'order' parameter. ASC or DESC are only permitted"
              );
            });
        });
        test("400 - responds with custom error message 'Reviews cannot be sorted by '...'' when not permitted order query value requested and category does exist, and valid order query value requested", () => {
          return request(app)
            .get(`/api/reviews?category=dexterity&sort_by=author&order=ASC`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe("Reviews cannot be sorted by 'author'");
            });
        });
        test("404 - responds with error message 'Category not found' when not permitted order query value requested and category does not exist, and valid order query value requested", () => {
          return request(app)
            .get(`/api/reviews?category=superset&sort_by=author&order=ASC`)
            .expect(404)
            .then(({ body: { message } }) => {
              expect(message).toBe(`Category with slug 'superset' not found`);
            });
        });
        test("400 - responds with custom error message when query is valid but a value of p (page) not a number", () => {
          return request(app)
            .get(
              `/api/reviews?category=dexterity&sort_by=owner&order=ASC&p=last`
            )
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Invalid query value of 'p' parameter. Positive number is only permitted`
              );
            });
        });
        test("400 - responds with custom error message when query is valid but a value of limit not a number", () => {
          return request(app)
            .get(
              `/api/reviews?category=dexterity&sort_by=owner&order=ASC&p=1&limit='ten'`
            )
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Invalid query value of 'limit' parameter. Positive number is only permitted`
              );
            });
        });
        test("400 - responds with custom error message when query is valid but a value of limit is negative", () => {
          return request(app)
            .get(
              `/api/reviews?category=dexterity&sort_by=owner&order=ASC&p=1&limit=-10`
            )
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Invalid query value of 'limit' parameter. Positive number is only permitted`
              );
            });
        });
        test("400 - responds with custom error message when query is valid but a value of limit is 0", () => {
          return request(app)
            .get(
              `/api/reviews?category=dexterity&sort_by=owner&order=ASC&limit=0`
            )
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Invalid query value of 'limit' parameter. Positive number is only permitted`
              );
            });
        });
        test("400 - responds with custom error message when query is valid but a value of p is negative", () => {
          return request(app)
            .get(
              `/api/reviews?category=dexterity&sort_by=owner&order=ASC&p=0&limit=10`
            )
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Invalid query value of 'p' parameter. Positive number is only permitted`
              );
            });
        });
        test("400 - responds with custom error message when query is valid but a value of p is negative", () => {
          return request(app)
            .get(
              `/api/reviews?category=dexterity&sort_by=owner&order=ASC&p=-100&limit=10`
            )
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Invalid query value of 'p' parameter. Positive number is only permitted`
              );
            });
        });
        test("400 - responds with custom error message when query is valid but a value of p is 0", () => {
          return request(app)
            .get(
              `/api/reviews?category=dexterity&sort_by=owner&order=ASC&p=0&limit=10`
            )
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Invalid query value of 'p' parameter. Positive number is only permitted`
              );
            });
        });
      });
    });

    describe("POST", () => {
      describe("Successful Responses", () => {
        test("201 - responds with a newly added review", () => {
          const newReview = {
            owner: "mallionaire",
            title: "Habitats",
            review_body:
              "Habitats offers a thinky puzzle to baffle the brain. Optimising the array in front of you is the head-scratcher, as points are fairly limited. It is certainly fun to see your nature park grow, and attempt to meet as many scoring objectives as you can. Habitats falls into the category of games that are easy to learn but tricky to master.",
            designer: "Habitat",
            category: "dexterity",
            review_img_url: "https://i.ibb.co/8sytkzP/dogs-g54858c180-1280.jpg",
          };
          return request(app)
            .post("/api/reviews")
            .send(newReview)
            .expect(201)
            .then(({ body: { insertedReview } }) => {
              expect(insertedReview).toEqual(
                expect.objectContaining({
                  ...expectedReviewShape,
                  ...newReview,
                  review_id: 14,
                })
              );
            });
        });
        test("201 - responds with a newly added review", () => {
          const newReview = {
            owner: "mallionaire",
            title: "Habitats",
            review_body:
              "Habitats offers a thinky puzzle to baffle the brain. Optimising the array in front of you is the head-scratcher, as points are fairly limited. It is certainly fun to see your nature park grow, and attempt to meet as many scoring objectives as you can. Habitats falls into the category of games that are easy to learn but tricky to master.",
            designer: "Habitat",
            category: "dexterity",
            review_img_url: "https://i.ibb.co/8sytkzP/dogs-g54858c180-1280.jpg",
          };
          return request(app)
            .post("/api/reviews")
            .send(newReview)
            .expect(201)
            .then(({ body: { insertedReview } }) => {
              expect(insertedReview).toEqual(
                expect.objectContaining({
                  ...expectedReviewShape,
                  ...newReview,
                  review_id: 14,
                })
              );
            });
        });
        test("201 - responds with a newly added review without review_img_url, but sets a default instead", () => {
          const newReview = {
            owner: "mallionaire",
            title: "Habitats",
            review_body:
              "Habitats offers a thinky puzzle to baffle the brain. Optimising the array in front of you is the head-scratcher, as points are fairly limited. It is certainly fun to see your nature park grow, and attempt to meet as many scoring objectives as you can. Habitats falls into the category of games that are easy to learn but tricky to master.",
            designer: "Habitat",
            category: "dexterity",
          };
          return request(app)
            .post("/api/reviews")
            .send(newReview)
            .expect(201)
            .then(({ body: { insertedReview } }) => {
              expect(insertedReview).toEqual(
                expect.objectContaining({
                  ...expectedReviewShape,
                  ...newReview,
                  review_id: 14,
                  review_img_url:
                    "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=700&h=700",
                })
              );
            });
        });
      });
      describe("Unsuccessful Responses", () => {
        test("400 - responds with bad request error message when wrong object type passed in", () => {
          const newReview = "";
          return request(app)
            .post("/api/reviews")
            .send(newReview)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe("Bad request");
            });
        });

        test("404 - responds with custom not found error message when valid object passed in but owner does not exists", () => {
          const newReview = {
            owner: "mallionaire2",
            title: "Habitats",
            review_body:
              "Habitats offers a thinky puzzle to baffle the brain. Optimising the array in front of you is the head-scratcher, as points are fairly limited. It is certainly fun to see your nature park grow, and attempt to meet as many scoring objectives as you can. Habitats falls into the category of games that are easy to learn but tricky to master.",
            designer: "Habitat",
            category: "dexterity",
          };
          return request(app)
            .post("/api/reviews")
            .send(newReview)
            .expect(404)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Owner with username '${newReview.owner}' not found`
              );
            });
        });
        test("404 - responds with custom not found error message when valid object passed in but category does not exists", () => {
          const newReview = {
            owner: "mallionaire",
            title: "Habitats",
            review_body:
              "Habitats offers a thinky puzzle to baffle the brain. Optimising the array in front of you is the head-scratcher, as points are fairly limited. It is certainly fun to see your nature park grow, and attempt to meet as many scoring objectives as you can. Habitats falls into the category of games that are easy to learn but tricky to master.",
            designer: "Habitat",
            category: "dexterity22",
          };
          return request(app)
            .post("/api/reviews")
            .send(newReview)
            .expect(404)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Category with slug '${newReview.category}' not found`
              );
            });
        });
        test("400 - responds with custom error message when when valid object passed in but review body is less then 20 characters", () => {
          const newReview = {
            owner: "mallionaire",
            title: "Habitats",
            review_body: "Hab",
            designer: "Habitat",
            category: "dexterity",
          };
          return request(app)
            .post("/api/reviews")
            .send(newReview)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Review body should be at least 20 characters long`
              );
            });
        });
        test("400 - responds with custom error message when when valid object passed in but review title is less then 3 characters", () => {
          const newReview = {
            owner: "mallionaire",
            title: "Ha",
            review_body:
              "Habitats offers a thinky puzzle to baffle the brain. Optimising the array in front of you is the head-scratcher.",
            designer: "Habitat",
            category: "dexterity",
          };
          return request(app)
            .post("/api/reviews")
            .send(newReview)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Review title should be at least 3 characters long`
              );
            });
        });
        test("400 - responds with custom error message when when valid object passed in but designer field is less then 2 characters", () => {
          const newReview = {
            owner: "mallionaire",
            title: "Habitats",
            review_body:
              "Habitats offers a thinky puzzle to baffle the brain. Optimising the array in front of you is the head-scratcher.",
            designer: "H",
            category: "dexterity",
          };
          return request(app)
            .post("/api/reviews")
            .send(newReview)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Designer should be at least 2 characters long`
              );
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
        test("200 - responds with a review object including comment_count by review_id", () => {
          const reviewId = 2;
          return request(app)
            .get(`/api/reviews/${reviewId}`)
            .expect(200)
            .then(({ body: { review } }) => {
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
                  comment_count: 3,
                })
              );
            });
        });
      });

      describe("Unsuccessful Responses", () => {
        test("400 - responds with message 'Bad request' when wrong type passed in as review_id", () => {
          const reviewId = "something-illegal";
          return request(app)
            .get(`/api/reviews/${reviewId}`)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });
        test("404 - responds with message 'Review not found' when review_id doesn't exist", () => {
          const reviewId = 9999999;
          return request(app)
            .get(`/api/reviews/${reviewId}`)
            .expect(404)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe(
                `Review with review_id '${reviewId}' not found`
              );
            });
        });
      });
    });

    describe("PATCH", () => {
      describe("Successful Responses", () => {
        test("200 - responds with updated review when increase votes", () => {
          const reviewId = 2;
          const patchObject = {
            inc_votes: 5,
          };
          return request(app)
            .patch(`/api/reviews/${reviewId}`)
            .send(patchObject)
            .expect(200)
            .then(({ body: { updatedReview } }) => {
              expect(updatedReview).toEqual(
                expect.objectContaining({
                  review_id: reviewId,
                  title: expect.any(String),
                  review_body: expect.any(String),
                  designer: expect.any(String),
                  review_img_url: expect.any(String),
                  votes: 10,
                  category: expect.any(String),
                  owner: expect.any(String),
                  created_at: expect.any(String),
                })
              );
            });
        });
        test("200 - responds with updated review when decrease votes by passing negative inc_votes as a body object", () => {
          const reviewId = 2;
          const patchObject = {
            inc_votes: -10,
          };
          return request(app)
            .patch(`/api/reviews/${reviewId}`)
            .send(patchObject)
            .expect(200)
            .then(({ body: { updatedReview } }) => {
              expect(updatedReview).toEqual(
                expect.objectContaining({
                  review_id: reviewId,
                  title: expect.any(String),
                  review_body: expect.any(String),
                  designer: expect.any(String),
                  review_img_url: expect.any(String),
                  votes: -5,
                  category: expect.any(String),
                  owner: expect.any(String),
                  created_at: expect.any(String),
                })
              );
            });
        });
      });

      describe("Unsuccessful Responses", () => {
        test("400 - responds with message 'Bad request' when empty body passed in", () => {
          const reviewId = 2;
          const patchObject = "";
          return request(app)
            .patch(`/api/reviews/${reviewId}`)
            .send(patchObject)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });
        test("400 - responds with message 'Bad request' when empty body object passed in", () => {
          const reviewId = 2;
          const patchObject = {};
          return request(app)
            .patch(`/api/reviews/${reviewId}`)
            .send(patchObject)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });
        test("404 - responds with custom not found error message when request is valid but review doesn't exist", () => {
          const reviewId = 9999999;
          const patchObject = "";
          return request(app)
            .patch(`/api/reviews/${reviewId}`)
            .send(patchObject)
            .expect(404)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe(
                `Review with review_id '${reviewId}' not found`
              );
            });
        });
        test("400 - responds with message 'Bad request' when review_id is wrong type but patch object is valid", () => {
          const reviewId = "twentyTwo";
          const patchObject = {
            inc_votes: 5,
          };
          return request(app)
            .patch(`/api/reviews/${reviewId}`)
            .send(patchObject)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });
        test("400 - responds with message 'Bad request' when no object has been send", () => {
          const reviewId = 2;
          return request(app)
            .patch(`/api/reviews/${reviewId}`)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });
        test("400 - responds with message 'Bad request' when body object has inc_votes with wrong data type", () => {
          const reviewId = 2;
          const patchObject = { inc_votes: "plus2" };
          return request(app)
            .patch(`/api/reviews/${reviewId}`)
            .send(patchObject)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
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
            .then(({ body: { comments } }) => {
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
              expect(comments).toBeSortedBy("created_at", {
                descending: true,
                coerce: true,
              });
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
              expect(message).toBe(
                `Review with review_id '${reviewId}' not found`
              );
            });
        });
      });
    });

    describe("GET ?p=...&limit=...", () => {
      describe("Successful Responses", () => {
        test("200 - responds with an array of comments for specific review_id and should be sorted by created_at in descending order and should be limited by 2", () => {
          const reviewId = 2;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments?p=2&limit=2`)
            .expect(200)
            .then(({ body: { comments, total_count, max_pages } }) => {
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
              expect(total_count).toBe(3);
              expect(max_pages).toBe(2);
              expect(comments).toHaveLength(1);
              expect(comments).toBeSortedBy("created_at", {
                descending: true,
                coerce: true,
              });
            });
        });

        test("200 - responds with an array of comments for specific review_id and should be sorted by created_at in descending order and should be not be limited", () => {
          const reviewId = 2;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments?p=1`)
            .expect(200)
            .then(({ body: { comments, total_count, max_pages } }) => {
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
              expect(total_count).toBe(3);
              expect(max_pages).toBe(1);
              expect(comments).toHaveLength(3);
              expect(comments).toBeSortedBy("created_at", {
                descending: true,
                coerce: true,
              });
            });
        });
        test("200 - responds with an array of comments for specific review_id and should be sorted by created_at in descending order and should be not be limited", () => {
          const reviewId = 2;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments?limit=1`)
            .expect(200)
            .then(({ body: { comments, total_count, max_pages } }) => {
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
              expect(total_count).toBe(3);
              expect(max_pages).toBe(3);
              expect(comments).toHaveLength(1);
              expect(comments).toBeSortedBy("created_at", {
                descending: true,
                coerce: true,
              });
            });
        });
        test("200 - responds with empty comments array when p is out of range", () => {
          const reviewId = 2;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments?p=10`)
            .expect(200)
            .then(({ body: { comments, total_count, max_pages } }) => {
              expect(total_count).toBe(3);
              expect(max_pages).toBe(1);
              expect(comments).toHaveLength(0);
            });
        });
        test("400 - responds with custom error message when query is valid but a value of limit not a number", () => {
          const reviewId = 2;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments?limit=last`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Invalid query value of 'limit' parameter. Positive number is only permitted`
              );
            });
        });
        test("400 - responds with custom error message when query is valid but a value of limit is negative", () => {
          const reviewId = 2;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments?limit=-10`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Invalid query value of 'limit' parameter. Positive number is only permitted`
              );
            });
        });
        test("400 - responds with custom error message when query is valid but a value of limit is 0", () => {
          const reviewId = 2;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments?limit=0`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Invalid query value of 'limit' parameter. Positive number is only permitted`
              );
            });
        });
        test("400 - responds with custom error message when query is valid but a value of p (page) not a number", () => {
          const reviewId = 2;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments?p=last`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Invalid query value of 'p' parameter. Positive number is only permitted`
              );
            });
        });
        test("400 - responds with custom error message when query is valid but a value of p is negative", () => {
          const reviewId = 2;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments?p=-100&limit=10`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Invalid query value of 'p' parameter. Positive number is only permitted`
              );
            });
        });
        test("400 - responds with custom error message when query is valid but a value of p is zero", () => {
          const reviewId = 2;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments?p=0`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Invalid query value of 'p' parameter. Positive number is only permitted`
              );
            });
        });
      });
      describe("Unsuccessful Responses", () => {
        test("400 - responds with message 'Bad request' when wrong type of review_id passed in, but queries are valid", () => {
          const reviewId = "two";
          return request(app)
            .get(`/api/reviews/${reviewId}/comments?p=1&limit=2`)
            .expect(400)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe("Bad request");
            });
        });
        test("404 - responds with message 'Review not found' when review_id doesn't exist, but queries are valid", () => {
          const reviewId = 99999999;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments?p=1&limit=2`)
            .expect(404)
            .then(({ body }) => {
              const { message } = body;
              expect(message).toBe(
                `Review with review_id '${reviewId}' not found`
              );
            });
        });
        test("404 - responds with message 'Review not found' when review_id doesn't exist", () => {
          const reviewId = 99999999;
          return request(app)
            .get(`/api/reviews/${reviewId}/comments`)
            .expect(404)
            .then(({ body }) => {
              const { message } = body;
              expect(message).toBe(
                `Review with review_id '${reviewId}' not found`
              );
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
            .then(({ body: { insertedComment } }) => {
              expect(insertedComment).toMatchObject({
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
        test("404 - responds with message 'Bad request' when user doesn't exist", () => {
          const reviewId = 1;
          const comment = {
            username: "mallionaire2222",
            body: "Amazing board game!",
          };
          return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(404)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `User with username '${comment.username}' not found`
              );
            });
        });
        test("404 - responds with custom not found error message when review doesn't exist", () => {
          const reviewId = 999999999;
          const comment = {
            username: "mallionaire",
            body: "Amazing board game!",
          };
          return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(404)
            .then(({ body }) => {
              const { message } = body;

              expect(message).toBe(
                `Review with review_id '${reviewId}' not found`
              );
            });
        });
        test("400 - responds with message 'Bad request' when review_id is wrong type", () => {
          const reviewId = "okokokok";
          const comment = {
            username: "mallionaire",
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

              expect(message).toBe("Comment body cannot be empty");
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
            .then(({ body: { users } }) => {
              users.forEach((user) => {
                expect(user).toHaveProperty("username", expect.any(String));
                expect(user).toHaveProperty("name", expect.any(String));
                expect(user).toHaveProperty("avatar_url", expect.any(String));
              });
              expect(users).toHaveLength(4);
            });
        });
        test("200 - responds with an empty array of reviews objects if there is no reviews", async () => {
          await emptyUsersTable();
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

  describe("/api/users/:username", () => {
    describe("GET", () => {
      describe("Successful Responses", () => {
        test("200 - responds with a user object defined by username", () => {
          const username = "bainesface";
          return request(app)
            .get(`/api/users/${username}`)
            .expect(200)
            .then(({ body: { user } }) => {
              expect(user).toEqual(
                expect.objectContaining({
                  username: "bainesface",
                  name: "sarah",
                  avatar_url:
                    "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
                })
              );
            });
        });
      });

      describe("Unsuccessful Responses", () => {
        test("404 - responds with message 'User with username '...' not found' when username doesn't exist", () => {
          const username = "lol";
          return request(app)
            .get(`/api/users/${username}`)
            .expect(404)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `User with username '${username}' not found`
              );
            });
        });
      });
    });
  });

  describe("/api/comments/:comment_id", () => {
    describe("DELETE", () => {
      describe("Successful Responses", () => {
        test("204 - responds with no content on successful deletion", () => {
          const commentId = 1;
          return request(app)
            .delete(`/api/comments/${commentId}`)
            .expect(204, "");
        });
      });
      describe("Unsuccessful Responses", () => {
        test("404 - responds with error message 'Comment not found' when valid comment_id passed in but non-existent comment", () => {
          const commentId = 999999999;
          return request(app)
            .delete(`/api/comments/${commentId}`)
            .expect(404)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Comment with comment_id '${commentId}' not found`
              );
            });
        });
        test("400 - responds with error message 'Bad request' when invalid comment_id passed in", () => {
          const commentId = "first one";
          return request(app)
            .delete(`/api/comments/${commentId}`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe("Bad request");
            });
        });
      });
    });

    describe("PATCH", () => {
      describe("Successful Responses", () => {
        test("200 - responds with updated comment when increase votes", () => {
          const commentId = 4;
          const patchObject = {
            inc_votes: 1,
          };
          return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patchObject)
            .expect(200)
            .then(({ body: { updatedComment } }) => {
              expect(updatedComment).toEqual(
                expect.objectContaining({
                  comment_id: commentId,
                  body: expect.any(String),
                  review_id: expect.any(Number),
                  author: expect.any(String),
                  votes: 17,
                  created_at: expect.any(String),
                })
              );
            });
        });
        test("200 - responds with updated comment when decrease votes by passing negative inc_votes as a body object", () => {
          const commentId = 4;
          const patchObject = {
            inc_votes: -1,
          };
          return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patchObject)
            .expect(200)
            .then(({ body: { updatedComment } }) => {
              expect(updatedComment).toEqual(
                expect.objectContaining({
                  comment_id: commentId,
                  body: expect.any(String),
                  review_id: expect.any(Number),
                  author: expect.any(String),
                  votes: 15,
                  created_at: expect.any(String),
                })
              );
            });
        });
      });
      describe("Unsuccessful Responses", () => {
        test("400 - responds with message 'Bad request' when empty body passed in", () => {
          const commentId = 4;
          const patchObject = "";
          return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patchObject)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe("Bad request");
            });
        });
        test("400 - responds with message 'Bad request' when empty body object passed in", () => {
          const commentId = 4;
          const patchObject = {};
          return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patchObject)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe("Bad request");
            });
        });
        test("404 - responds with message 'Comment with comment_id '999999' not found' when request is valid but comment doesn't exist", () => {
          const commentId = 999999;
          const patchObject = "";
          return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patchObject)
            .expect(404)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Comment with comment_id '${commentId}' not found`
              );
            });
        });
        test("400 - responds with message 'Bad request' when comment_id is wrong type but patch object is valid", () => {
          const commentId = "first";
          const patchObject = {
            inc_votes: -1,
          };
          return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patchObject)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(`Bad request`);
            });
        });
        test("400 - responds with message 'Bad request' when increase by more than 1", () => {
          const commentId = 4;
          const patchObject = {
            inc_votes: 5,
          };
          return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patchObject)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Votes only permitted to be changed by 1 or -1`
              );
            });
        });
        test("400 - responds with message 'Bad request' when decrease by more than 1", () => {
          const commentId = 4;
          const patchObject = {
            inc_votes: 5,
          };
          return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patchObject)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe(
                `Votes only permitted to be changed by 1 or -1`
              );
            });
        });
        test("400 - responds with message 'Bad request' when no object has been send", () => {
          const commentId = 4;
          return request(app)
            .patch(`/api/comments/${commentId}`)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe("Bad request");
            });
        });
        test("400 - responds with message 'Bad request' when body object has inc_votes with wrong data type", () => {
          const commentId = 4;
          const patchObject = { inc_votes: "by 2" };
          return request(app)
            .patch(`/api/comments/${commentId}`)
            .send(patchObject)
            .expect(400)
            .then(({ body: { message } }) => {
              expect(message).toBe("Bad request");
            });
        });
      });
    });
  });

  describe("/api/non-existent-endpoint", () => {
    describe("Unsuccessful Responses", () => {
      describe("GET", () => {
        test("404 - responds with custom not found error message", () => {
          return request(app)
            .get("/api/non-existent-endpoint")
            .expect(404)
            .then(({ body }) => {
              expect(body).toHaveProperty(
                "message",
                "GET /api/non-existent-endpoint not found"
              );
            });
        });
      });
      describe("POST", () => {
        test("404 - responds with custom not found error message", () => {
          return request(app)
            .post("/api/post_it")
            .expect(404)
            .then(({ body }) => {
              expect(body).toHaveProperty(
                "message",
                "POST /api/post_it not found"
              );
            });
        });
      });
    });
  });
});
