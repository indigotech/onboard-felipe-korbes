import { url } from "../src/setup-server";
import { expect } from "chai";
import { prisma } from "../src/setup-db";
import { hashPassword } from "../src/graphql/resolvers";
import { generateToken } from "../src/graphql/helpers/login-handlers";
import axios from "axios";

const getUserByID = `#graphql
  query GetUser ($id: Int!) {
    getUser(id: $id) {
      id
      name
      email
      birthDate
      addresses {
        street
        streetNumber
        city
        zipCode
        state
    }
    }
  }`;

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

    const expectedUserDB = userDB && {
      id: userDB.id,
      name: userDB.name,
      email: userDB.email,
      birthDate: userDB.birthDate,
      addresses: []
    };

    expect(userQueryResponse.data.getUser).to.be.deep.eq(expectedUserDB);
  });

  it("Found a user with an address", async function () {
    const userDB = await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: "123abc",
        birthDate: "01-01-2000",
        addresses: {
          create: [
            {
              zipCode: 12345678,
              street: "Street 1",
              streetNumber: 1,
              city: "City 1",
              state: "State 1"
            }
          ]
        }
      }
    });
    const address = await prisma.address.findMany({
      where: {
        userID: userDB.id
      }
    });

    const expectedAddress1 = {
      id: address[0].id,
      zipCode: 12345678,
      street: "Street 1",
      complement: null,
      neighborhood: null,
      streetNumber: 1,
      city: "City 1",
      state: "State 1",
      userID: userDB.id
    };

    expect(address[0]).to.be.deep.eq(expectedAddress1);
    await prisma.address.deleteMany({});
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
