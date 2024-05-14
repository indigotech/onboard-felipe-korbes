import { url } from "../src/setup-server";
import { expect } from "chai";
import { prisma } from "../src/setup-db";
import { hashPassword } from "../src/graphql/resolvers";
import { generateToken } from "../src/graphql/helpers/login-handlers";
import axios from "axios";
import { populateDatabase } from "../src/seed";

const getUserByID = `#graphql
  query GetUser ($id: Int!) {
    getUser(id: $id) {
      id
      name
      email
      birthDate
    }
  }`;

async function getUserByIDRequest(url: string, id: number, token: string) {
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

const getManyUsers = `#graphql 
  query GetManyUsers ($limit: Int) {
    getManyUsers(limit: $limit) {
      id
      name
      email
    }
  }`;

async function getManyUsersRequest(url: string, limit: number, token: string) {
  const response = await axios.post(
    url,
    {
      query: getManyUsers,
      variables: {
        limit
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
    const userQueryResponse = await getUserByIDRequest(url, userDB.id, token);

    const expectedUserDB = userDB && {
      id: userDB.id,
      name: userDB.name,
      email: userDB.email,
      birthDate: userDB.birthDate
    };

    expect(userQueryResponse.data.getUser).to.be.deep.eq(expectedUserDB);
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
    const userQueryResponse = await getUserByIDRequest(url, 1, token);

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
    const userQueryResponse = await getUserByIDRequest(url, userDB.id, "invalidToken123");

    expect(userQueryResponse.errors).to.be.deep.eq([
      {
        code: 401,
        message: "Operação não autorizada"
      }
    ]);
  });

  it("Tried to find many users in the database", async function () {
    await populateDatabase(7);

    const token = generateToken(1, false);

    const userQueryResponse = await getManyUsersRequest(url, 5, token);
    expect(userQueryResponse.data.getManyUsers.length).to.be.equal(5);
  });

  it("Tried to find more users than there are in the database", async function () {
    await populateDatabase(3);

    const token = generateToken(1, false);

    const userQueryResponse = await getManyUsersRequest(url, 5, token);
    expect(userQueryResponse.data.getManyUsers.length).to.be.equal(3);
  });

  it("Tried to find user with an invalid token", async function () {
    await populateDatabase(7);

    const userQueryResponse = await getManyUsersRequest(url, 5, "invalidtoken123");
    expect(userQueryResponse.errors).to.be.deep.eq([
      {
        code: 401,
        message: "Operação não autorizada"
      }
    ]);
  });
});
