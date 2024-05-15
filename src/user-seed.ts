import { faker } from "@faker-js/faker";
import { prisma } from "./setup-db";
import { hashPassword } from "./graphql/resolvers";

export interface UserSeedInfo {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}
export function createRandomUser(): UserSeedInfo {
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

export async function userSeed(limit: number) {
  const users: UserSeedInfo[] = faker.helpers.multiple(createRandomUser, {
    count: limit
  });
  const usersWithHashedPasswords = await Promise.all(
    users.map(async (user) => {
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
