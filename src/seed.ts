import { faker } from "@faker-js/faker";
import { prisma } from "./setup-db";
import { hashPassword } from "./graphql/resolvers";
import { setupDatabase } from "./setup-db";

interface userSeedInfo {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}
function createRandomUser(): userSeedInfo {
  return {
    password: faker.internet.password(),
    email: faker.internet.email(),
    name: faker.internet.userName(),
    birthDate: faker.date
      .birthdate()
      .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
      .replace(/\//g, "-")
  };
}

const USERS: userSeedInfo[] = faker.helpers.multiple(createRandomUser, {
  count: 5
});

async function seed() {
  const usersWithHashedPasswords = await Promise.all(
    USERS.map(async (user) => {
      const hashedPassword = await hashPassword(user.password);
      return {
        ...user,
        password: hashedPassword
      };
    })
  );

  await prisma.user.createMany({
    data: usersWithHashedPasswords,
    skipDuplicates: true
  });
}

setupDatabase();
seed();
