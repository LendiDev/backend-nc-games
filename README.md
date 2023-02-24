# Northcoders House of Games API

![Units tests and E2E tests workflow](https://github.com/LendiDev/backend-nc-games/actions/workflows/run-tests.yml/badge.svg)

<br/>

This is RESTful API for NC House of Games Front-End that designed to serve reviews, comments, users, categories related to board games. The API is built using NodeJS, Express, PostgreSQL, and is designed to be fast, scalable, and easy to use.

The users can access reviews on board games from other users and comments on those reviews. They can also post and delete comments for the reviews.

<br/>

## Hosted Version

You can access the hosted version of this API at https://nc-games.lendi.dev/api

<br/>

## Prerequisites

This API was developed and tested using:

* Node.js v19.2.0
* Postgres v14.6

Before you start, you should have the following installed on your machine:

* You can download Node.js from the official website: https://nodejs.org/.
* You can download Postgres from the official website: https://www.postgresql.org/.

<br/>

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

    Or here is an example how they should look like:

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

   Make sure that you have **PostgresSQL** installed and it is running on your local machine.

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
    
<br/>

### Testing

To run the tests for this API, follow this step:


1. Run the tests using `npm`:

    ```sh
    npm test
    ```

The tests should now be run, and you should see the results in the console.

