import { UserInput } from "./schema";
import { Prisma } from "@prisma/client";
import { prisma } from "../setup-db";
import bcrypt from "bcrypt";

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
      if (data.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const lettersAndNumbers: boolean = /[a-zA-Z]/.test(data.password) && /[0-9]/.test(data.password);
      if (!lettersAndNumbers) {
        throw new Error("Password must contain at least one letter and one number");
      }
      const hashedPassword = await hashPassword(data.password);

      try {
        const newUser = await prisma.user.create({
          data: {
            name: data.name,
            password: hashedPassword,
            email: data.email,
            birthDate: data.birthDate
          }
        });

        return newUser;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.message.includes("Unique constraint failed on the fields: (`email`)")) {
            throw new Error("Email already exists");
          }
        }

        throw error;
      }
    }
  }
};
