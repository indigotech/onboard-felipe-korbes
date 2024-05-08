import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";

export let server: ApolloServer;

export async function setupServer() {
  console.log("Starting server setup");
  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT ?? "4000") }
  });

  console.log("Server setup complete");
  console.log(`Server ready at: ${url}`);
}
