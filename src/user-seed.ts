import { faker } from "@faker-js/faker";
import { prisma } from "./setup-db";
import { hashPassword } from "./graphql/resolvers";

export interface userSeedInfo {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}
export function createRandomUser(): userSeedInfo {
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
  const USERS: userSeedInfo[] = faker.helpers.multiple(createRandomUser, {
    count: limit
  });
  for (const user of USERS) {
    const hashedPassword = await hashPassword(user.password);
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        birthDate: user.birthDate
      }
    });
  }
}
