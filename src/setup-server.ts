import { context } from "./graphql/helpers/authentication-handler";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { formatError } from "./graphql/helpers/error-handlers";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

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
    listen: { port: parseInt(process.env.PORT ?? "4002") },
    context
  });

  url = getUrl;
  console.log("Server setup complete");
  console.log(`Server ready at: ${url}`);
}
