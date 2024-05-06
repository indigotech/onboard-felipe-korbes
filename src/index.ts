import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { PrismaClient } from "@prisma/client";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";

const prisma = new PrismaClient();

async function main() {
  const allUsers = await prisma.user.findMany({
    where: {
      name: {
        contains: "Felipe"
      }
    }
  });
  console.log(allUsers);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

const server = new ApolloServer({
  typeDefs,
  resolvers
});

(async () => {
  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 }
    });

    console.log(`🚀 Server ready at: ${url}`);
  } catch (error) {
    console.error("Error starting the server:", error);
  }
})();
