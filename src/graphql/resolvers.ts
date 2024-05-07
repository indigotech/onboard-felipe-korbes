import { UserInput } from "./schema";

export const resolvers = {
  Query: {
    hello: () => "Hello world!"
  },
  Mutation: {
    createUser: (
      parent: any,
      args: { data: UserInput },
      context: any,
      info: any
    ) => {
      const { data } = args;
      const newUser = {
        id: "7",
        name: data.name,
        email: data.email,
        birthDate: data.birthDate
      };

      return newUser;
    }
  }
};
