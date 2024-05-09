import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { formatError } from "./graphql/error-handlers";

export let server: ApolloServer;
export let url: string;

export async function setupServer() {
  console.log("Starting server setup");

  server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT ?? "4002") }
  });

  console.log("Server setup complete");
  console.log(`Server ready at: ${url}`);
}
