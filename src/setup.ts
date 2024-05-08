import { setupDatabase } from "./setup-db";
import { setupServer } from "./setup-server";

export async function setup() {
  await setupDatabase();
  await setupServer();
  console.log(`${process.env.ENV}`);
}
