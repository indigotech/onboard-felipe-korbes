# On-Board - Felipe Korbes - Backend

### Project's Description

In this repository you will find all files and information related the the on-boarding project for the backend server that will be created. On top of that, you can also find everything related to the database created for the project.

The goal of the project thus far is to create and interact with a database using GraphQL and Prisma. So far, an entity called user has been created, which can be manipulated in any way using CRUD commands.

### Environment and Tools
This project uses [TypeScript](https://www.typescriptlang.org/), [NodeJS](https://nodejs.org/en), [Apollo](https://www.apollographql.com/), [GraphQL](https://graphql.org/) and [Prisma](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/). NodeJS is being used for us to run JavaScript code in the backend as a means to create a server. Typescript is being used to make JavaScript a statically typed language, making development easier and more straightforward. Apollo and GraphQL are being used together to manage and test requests that can be made with the schemas created in the project. Lastly, Prisma and PostgreSQL are being used to manage the database, allowing us to use object relational mapping to create and handle our data.

### Development  
So far, all the tools listed above have been implemented and tested in their most basic form. To run the code on your machine, you can follow the steps below.

Before cloning the repository to your machine, make sure you have [Node.js](https://nodejs.org/en) and a PostgreSQL database running on your machine. In order to get an instance of a PostgreSQL running on your machine, you can use [Docker](https://www.docker.com/). If using Docker on Linux, you can start it by running

```plaintext
sudo systemctl start docker
```

You can also try running `docker run hello-world` to check if everything is in order.

After checking that everything is okay, you can run the following command to start the PostgreSQL server.

```plaintext
docker compose up -d
```

If everything went well so far, you can setup your .env file. A .env.test has been provided, whose contents you can copy, change its credentials that are in docker-compose-yml file and add it to a .env file. If for whatever reason you wish to name your .env files to something else, don't forget the change the appropriate scrips in packages.json, otherwise the commands below will not work.

Once you have you environments setup, you can run the command below

```plaintext
npm start
```

This command will start the Apollo server on port 4000. From here on out you can add other users in the database as you see fit using the Apollo Server on your browser throgh the mutation implemented in the resolvers. The query and mutation you can run are:

```graphql
query Greeting {
    hello
}

mutation {
  createUser(data: {
    name: "New User",
    email: "new@example.com",
    password: "123abc",
    birthDate: "01-01-2002"
  }) {
    id
    name
    email
    birthDate
  }
}

```

Other useful commands are:

+ `npm run migrateServer` to apply the changes made do schema.prisma in the development server 
+ `npm run migrateTest` to apply the changes made do schema.prisma in the test server
+ `npm run startTest` to start the server with the test database
+ `npm run studioTest` to open prisma studio with the test database
+ `npx prisma studo` to open prisma studio with the development database 
+ `npm test` to run the tests

