import { prisma } from "../setup-db";
import { UserInput, LoginInput } from "./schema";
import { generateToken, loginUser } from "./helpers/login-handlers";
import { hasLettersAndNumbers, isValidEmail, isValidDate, isValidYear, passwordLenght } from "./helpers/error-handlers";
import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
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
      await isValidEmail(data.email);

      const hashedPassword = await hashPassword(data.password);

      return prisma.user.create({
        data: {
          name: data.name,
          password: hashedPassword,
          email: data.email,
          birthDate: data.birthDate
        }
      });
    },

    login: async (parent: any, args: { data: LoginInput }, context: any, info: any) => {
      const { data } = args;

      const user = await loginUser(data.email, data.password);

      const loggedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        birthDate: user.birthDate
      };
      const token = generateToken(loggedUser.id, data.rememberMe);
      return {
        user: loggedUser,
        token
      };
    }
  }
};
