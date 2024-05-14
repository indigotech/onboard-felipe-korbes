import { url } from "../src/setup-server";
import { expect } from "chai";
import { prisma } from "../src/setup-db";
import { getUserByID } from "./test-queries";
import { hashPassword } from "../src/graphql/resolvers";
import { generateToken } from "../src/graphql/helpers/login-handlers";
import axios, { AxiosRequestConfig } from "axios";
import { CustomError } from "../src/graphql/helpers/error-handlers";

async function serverRequest(url: string, id: number, token: string) {
  const response = await axios.post(
    url,
    {
      query: getUserByID,
      variables: {
        id
      }
    },
    {
      headers: {
        Authorization: token
      }
    }
  );
  return response.data;
}

describe("User Query Test", function () {
  it("Found a user", async function () {
    const hashedPassword = await hashPassword("123abc");

    const userDB = await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: hashedPassword,
        birthDate: "01-01-2000"
      }
    });

    const token = generateToken(userDB.id, false);
    const userQueryResponse = await serverRequest(url, userDB.id, token);

    const expectedUserDB = {
      id: userDB?.id,
      name: userDB?.name,
      email: userDB?.email,
      birthDate: userDB?.birthDate
    };

    expect(expectedUserDB).to.be.deep.eq(userQueryResponse.data.getUser);
  });

  it("Failed to find a user with an invalid id", async function () {
    const hashedPassword = await hashPassword("123abc");

    const userDB = await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: hashedPassword,
        birthDate: "01-01-2000"
      }
    });

    const token = generateToken(userDB.id, false);
    const userQueryResponse = await serverRequest(url, 1, token);

    expect(userQueryResponse.errors).to.be.deep.eq([
      {
        code: 404,
        message: "Usuário não encontrado"
      }
    ]);
  });

  it("Failed to find a user with an invalid token", async function () {
    const hashedPassword = await hashPassword("123abc");

    const userDB = await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: hashedPassword,
        birthDate: "01-01-2000"
      }
    });

    const token = generateToken(userDB.id, false);
    const userQueryResponse = await serverRequest(url, userDB.id, "invalidToken123");

    expect(userQueryResponse.errors).to.be.deep.eq([
      {
        code: 401,
        message: "Operação não autorizada"
      }
    ]);
  });
});
