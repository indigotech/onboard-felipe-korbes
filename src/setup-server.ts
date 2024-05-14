import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { formatError } from "./graphql/helpers/error-handlers";

export let server: ApolloServer;
export let url: string;

export async function setupServer() {
  console.log("Starting server setup");

  server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError
  });

  const { url: getUrl } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT ?? "4002") }
  });

  url = getUrl;
  console.log("Server setup complete");
  console.log(`Server ready at: ${url}`);
}
