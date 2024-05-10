import { LoginInput, UserInput } from "../../src/graphql/schema";
import jwt from "jsonwebtoken";

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

interface TokenPayload {
  id: number;
  name: string;
  email: string;
  birthDate: string;
}

export function verifyToken(token: string): TokenPayload {
  try {
    const secret = process.env.JWT_SECRET ?? "mysupersecret";
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
