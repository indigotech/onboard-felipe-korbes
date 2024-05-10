import { UserInput } from "./schema";
import { Prisma } from "@prisma/client";
import { prisma } from "../setup-db";
import bcrypt from "bcrypt";
import { hasLettersAndNumbers, invalidEmail, isValidDate, isValidYear, passwordLenght } from "./error-handlers";

const hashPassword = async (password: string) => {
  const saltRounds = 10;
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

      passwordLenght(data.password);
      hasLettersAndNumbers(data.password);
      isValidDate(data.birthDate);
      isValidYear(data.birthDate);

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
          await invalidEmail(data.email);
        }

        throw error;
      }
    }
  }
};
