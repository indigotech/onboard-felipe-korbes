import { PrismaClient } from "@prisma/client";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const prisma = new PrismaClient();

async function main() {
  // await prisma.user.create({
  //   data: {
  //     name: "John Doe",
  //     email: "john@prisma.io",
  //     age: 33,
  //   },
  // });

  // const post = await prisma.user.update({
  //   where: { id: 1 },
  //   data: { email: "felipe.korbes@taqtile.com.br" },
  // });
  // console.log(post);

  const allUsers = await prisma.user.findMany({
    where: {
      name: {
        contains: "Felipe",
      },
    },
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

const typeDefs = `#graphql
    type Query {
        hello: String
    }
`;

const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
};

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