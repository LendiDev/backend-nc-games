# Northcoders House of Games API

### Description

This is an API for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as reddit) which should provide this information to the front end architecture.

This API is using PSQL, and interaction with it using [node-postgres](https://node-postgres.com/).

### 1. Setting up the Environment

Before running the application or tests, you should ensure that all dependencies are installed by running the following command:

```
npm install
```

This will install all required dependencies for the project.

### 2. Setting up the Environment Variables

To run this project locally, you will need to set up environment variables for the two databases. The necessary environment variables are defined in two files named ***.env.development*** and ***.env.test***.

Before setting up the environment variables, you should first make a copy of the example environment file ***.env.example*** and rename it to ***.env.development*** and ***.env.test*** respectively.

The **PGDATABASE** environment variable defines the name of the database that the application will use for each environment. The difference between the development and test databases is that the development database is used to store data during the development process, while the test database is used to run automated tests against the application.

Next, open the ***.env.development*** and ***.env.test*** files and replace database_name_here with the name of your databases for each environment variable **PGDATABASE**.

Here's what the content of ***.env.development*** and ***.env.test*** files should look like:

***.env.development***
```
PGDATABASE=nc_games
```

***.env.test***
```
PGDATABASE=nc_games_test
```

For security reasons, you should never commit your environment variables to your code repository, which is why the ***.env.**** files are added to the ***.gitignore*** file.

### 3. Setting up the Databases

To set up the development and test databases, you need to use the following command:

```
npm run setup-dbs
```

This command will create the necessary databases using the names specified in the ***.env.development*** and ***.env.test*** files.

### 4. Seeding the Databases

In order to seed the development database with some initial data, you need to use the following command:

```
npm run seed
```