import { PrismaClient } from "@prisma/client";

export let prisma: PrismaClient;

export async function setupDatabase() {
  prisma = new PrismaClient();
}
