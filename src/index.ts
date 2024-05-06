import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import "reflect-metadata";

// make a connection to the database and adds a user to it
AppDataSource.initialize()
  .then(async () => {
    // console.log("Inserting a new user into the database...");
    // const user = new User();
    // user.firstName = "Felipe";
    // user.lastName = "Korbes";
    // user.age = 28;
    // await AppDataSource.manager.save(user);
    // console.log("Saved a new user with id: " + user.id);

    // console.log("Loading users from the database...");
    // const users = await AppDataSource.manager.find(User);
    // console.log("Loaded users: ", users);

    // console.log(
    //   "Here you can setup and run express / fastify / any other framework."
    // );
    const users = await AppDataSource.manager.find(User);
    console.log(users);

    const userFirstName = await AppDataSource.manager.findOneBy(User, {
      firstName: "Felipe",
    });
    console.log(userFirstName.lastName);
  })
  .catch((error) => console.log(error));

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
    type Query {
        hello: String
    }
`;

// Resolvers define how to fetch the types defined in your schema.
const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

(async () => {
  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port: 4001 },
    });

    console.log(`🚀 Server ready at: ${url}`);
  } catch (error) {
    console.error("Error starting the server:", error);
  }
})();
