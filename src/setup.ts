import { setupServer } from "./setup-server";
import { setupDatabase } from "./setup-db";

export async function setup() {
  await setupDatabase();
  await setupServer();
  console.log(`${process.env.ENV}`);
}
