import { faker } from "@faker-js/faker";
import { createRandomUser, userSeed, userSeedInfo } from "./user-seed";
import { setupDatabase } from "./setup-db";

async function populateDatabase(limit: number) {
  await setupDatabase();
  await userSeed(limit);
}

populateDatabase(30);
