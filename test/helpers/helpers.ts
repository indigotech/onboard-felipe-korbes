import { LoginInput, UserInput } from "../../src/graphql/schema";
import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export function loginUserMutation(data: LoginInput) {
  return `#graphql
  mutation {
    login(data: {
      email: "${data.email}",
      password: "${data.password}"
    }) {
      user {
        id
        name
        email
        birthDate
      }
      token
    }
  }`;
}

export function createUserMutation(data: UserInput) {
  return `#graphql
  mutation {
    createUser(data: {
      name: "${data.name}",
      email: "${data.email}",
      password: "${data.password}",
      birthDate: "${data.birthDate}"
    }) {
      id
      name
      email
      birthDate
    }
  }`;
}
