# On-Board - Felipe Korbes - Backend

### Project's Description

In this repository you will find all files and information related the the on-boarding project for the backend server that will be created. On top of that, you can also find everything related to the database created for the project.

The goal of the project thus far is to create and interact with a database using GraphQL and Prisma. So far, an entity called user has been created, which can be manipulated in any way using CRUD commands.

### Environment and Tools

This project uses [TypeScript](https://www.typescriptlang.org/), [NodeJS](https://nodejs.org/en), [Apollo](https://www.apollographql.com/), [GraphQL](https://graphql.org/) and [Prisma](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/). NodeJS is being used for us to run JavaScript code in the backend as a means to create a server. Typescript is being used to make JavaScript a statically typed language, making development easier and more straightforward. Apollo and GraphQL are being used together to manage and test requests that can be made with the schemas created in the project. Lastly, Prisma and PostgreSQL are being used to manage the database, allowing us to use object relational mapping to create and handle our data.

### Development

So far, all the tools listed above have been implemented and tested in their most basic form. To run the code on your machine, you can follow the steps below.

Before cloning the repository to your machine, make sure you have [Node.js](https://nodejs.org/en) and a PostgreSQL database running on your machine. In order to get an instance of a PostgreSQL running on your machine, you can use [Docker](https://www.docker.com/). If using Docker on Lnux, you can start it by running

```plaintext
sudo systemctl start docker
```

You can also try running `docker run hello-world` to check if everything is in order.

Before running any of the commands below, make sure that you cloned this respository and ran the command `npm install` in the root folder of the project. That will install all the packages necessary to run the project. After checking that everything is okay, you can run the following command to start the PostgreSQL server.

```plaintext
docker compose up -d
```

If everything went well so far, you can then run

```plaintext
npx ts-node src/index.ts
```

This command will start the Apollo server on port 4000 and will retrieve a list of all Users currently in the database and find any user with the name Felipe, which will be printed on the terminal. From here on out you can add, remove, update or find other users in the databasa as you see fit.

Furthermore, by accessing your localhost:4000, you will find the Apollo interface to run queries, mutations and more. You can type in

```graphql
query Greeting {
  hello
}
```

Which in turn will return `Hello World!`. It's also possible to "create a new user", by typing in

```graphql
mutation {
  createUser(
    data: { name: "John Doe", email: "john.doe@example.com", password: "supersecretpassword", birthDate: "01-01-1990" }
  ) {
    id
    name
    email
    birthDate
  }
}
```

This will run a mock test where we are receiving data from the client with their name, email, password and birthdate, which will return about the same thing, except for password, which will be substituted by ID.
