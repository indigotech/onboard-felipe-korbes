import { UserInput } from "./schema";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const hashPassword = async (password: string) => {
  const saltRounds = 10; // Number of salt rounds for bcrypt
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const resolvers = {
  Query: {
    hello: () => "Hello world!"
  },

  Mutation: {
    createUser: async (parent: any, args: { data: UserInput }, context: any, info: any) => {
      const { data } = args;
      const hashedPassword = await hashPassword(data.password);

      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          password: hashedPassword,
          email: data.email,
          birthDate: data.birthDate
        }
      });

      return newUser;
    }
  }
};
