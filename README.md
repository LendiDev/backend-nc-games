![Units tests and E2E tests workflow](https://github.com/LendiDev/backend-nc-games/actions/workflows/run-tests.yml/badge.svg)

# NC BoardGames API

This is RESTful API for NC BoardGames Front-End that designed to serve reviews, comments, users, categories related to board games. The API is built using Node.js, Express, PostgreSQL, and is designed to be fast, scalable, and easy to use.

The users can access reviews on board games from other users and comments on those reviews. They can also post and delete comments for the reviews. Also, up vote and down vote comments & reviews.

## Live version

Live version of this API can be found here: https://nc-games.lendi.dev/api

## Front-End based on this API
Live version of the Web Application can be found here : https://nc-bg.netlify.app/

## Front-End Repository 
The Front-End for this project is hosted in a separate repository. You can find it here: https://github.com/LendiDev/fe-nc-games/

## Challenges Faced

While developing the API for the NC BoardGames project, I encountered several challenges that contributed to my growth as a developer and enhanced the overall quality of the API. Some of the key challenges I faced when working with Node.js, Express, PostgreSQL:

1. <b>Testing and continuous integration</b>: Writing comprehensive tests for the API endpoints and ensuring a smooth continuous integration process was one of the challenges. I used tools like Jest and Supertest.

2. <b>Error handling</b>: Handling errors gracefully and providing useful feedback was important. I used custom error handling middleware.

3. <b>Express route handling</b>: Organizing and structuring Express routes in a scalable and maintainable way was another challenge. I employed best practices like modularization, models, controllers, middlewares, and proper error handling to ensure our API was easy to maintain and extend.

4. <b>Complex queries</b>: Crafting complex SQL queries for filtering, sorting, and aggregating data was challenging. I utilized PostgreSQL features like JOINs, subqueries, and aggregate functions (such as json_aggr, COUNT) to create efficient and flexible queries that met the API requirements.

5. <b>API documentation</b>: Providing clear documentation was essential. I used JSON to create a basic API documentation for all available end points (can be found here: https://nc-games.lendi.dev/api).

6. <b>CI/CD with GitHub Actions</b>: I have also integrated Continuous Integration and Continuous Deployment (CI/CD) using GitHub Actions. This enables me to automate the process of building and testing my application, ensuring that the codebase remains stable and functional at all times.

By overcoming these challenges, I was able to create a robust, scalable, and maintainable API that serves as a solid foundation for the NC BoardGames Front-End.

## Prerequisites

The minimum required versions of Node.js and Postgres:

* Node.js v12.x or higher
* Postgres v10.x or higher

> You can download Node.js from https://nodejs.org/.  
> You can download Postgres from https://www.postgresql.org/.

## Getting started

To install and run this API locally, follow these steps:

1. Clone the repository to your local machine:

    ```sh
    git clone https://github.com/LendiDev/backend-nc-games.git
    ```

2. Install the dependencies using `npm`:

    ```sh
    cd backend-nc-games
    npm install
    ```

3. Set up environment variables:

   Create two files named `.env.development` and ```.env.test``` in the root folder of the cloned repository and add **PGDATABASE** environment variable in each file with the names of your databases for development and testing. 

   The example of file content can be found in ```.env-example```. 

   Alternatively,  here is an example how they should look like:

    `.env.development`
    ```
    PGDATABASE=database_name
    ```

    `.env.test`
    ```
    PGDATABASE=database_name_test
    ```

4. Set up the databases:

   Update the database names in `./db/setup.sql` according to your environment variables.

   Make sure that you have **PostgresSQL** running on your local machine.

   Create local databases using `npm`:

    ```sh
    npm run setup-dbs
    ```

    Seed the local database with some sample data:

    ```sh
    npm run seed
    ```

5. Now you can start a server using:

    ```sh
    npm start
    ```

   The API should now be running at http://localhost:9090.
    


## Testing

To run the tests for this API, follow this step:


1. Run the tests using `npm`:

    ```sh
    npm test
    ```

The tests should now be run, and you should see the results in the console.
