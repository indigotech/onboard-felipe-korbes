import { PrismaClient } from "@prisma/client";

export let prisma: PrismaClient;

export async function setupDatabase() {
  console.log("Starting database setup");
  prisma = new PrismaClient();
  console.log("Database setup complete");
}
