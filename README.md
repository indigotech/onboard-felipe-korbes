# On-Board - Felipe Korbes - Backend

### Project's Description
In this repository you will find all files and information related the the on-boarding project for the backend server that will be created. On top of that, you can also find everything related to the database created for the project.

The goal of the project thus far is to create and interact with a database using GraphQL and Prisma. So far, an entity called user has been created, which can my manipulated in any way using CRUD commands.

### Environment and Tools
This project uses [TypeScript](https://www.typescriptlang.org/), [NodeJS](https://nodejs.org/en), [Apollo](https://www.apollographql.com/), [GraphQL](https://graphql.org/) and [Prisma](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/). NodeJS is being used for us to run JavaScript code in the backend as a means to create a server. Typescript is being used to make JavaScript a statically typed language, making development easier and more straightforward. Apollo and GraphQL are being used together to manage and test requests that can be made with the schemas created in the project. Lastly, Prisma and PostgreSQL are being used to manage the database, allowing us to use object relational mapping to create and handle our data.

### Development  
So far, all the tools listed above have been implemented and tested in their most basic form. By running the server and opening Apollo in the web browser, you will be able to make a query for 'hello', which will return 'Hello World!. The database implemented an entity called User, which has and ID, name, email and age, which can manipulated using basic CRUD commands compatible with Prisma.