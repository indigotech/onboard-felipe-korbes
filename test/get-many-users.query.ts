import { url } from "../src/setup-server";
import { expect } from "chai";
import { prisma } from "../src/setup-db";
import { userSeed } from "../src/user-seed";
import { defaultLimit } from "../src/graphql/schema";
import { generateToken } from "../src/graphql/helpers/login-handlers";
import axios from "axios";
import { User } from "@prisma/client";

const getManyUsersPagination = `#graphql 
  query GetManyUsers ($offset: Int, $limit: Int) {
    getManyUsers(offset: $offset, limit: $limit) {
      totalCount
      hasMoreUsers
      users {
        id
        name
        email
        birthDate
      }
    }
  }`;

interface ServerRequestInfo {
  url: string;
  token: string;
  limit?: number;
  offset?: number;
}
async function serverRequest(params: ServerRequestInfo) {
  const { url, token, limit = defaultLimit, offset = 0 } = params;
  const response = await axios.post(
    url,
    {
      query: getManyUsersPagination,
      variables: {
        limit,
        offset
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

function generateUsers(numberOfUsers: number): User[] {
  const usersDB = [];

  for (let i = 1; i <= numberOfUsers; i++) {
    usersDB.push({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      password: "123abc",
      birthDate: "01-01-2000",
      age: null
    });
  }

  return usersDB;
}

function getExpectedUsers(users: User[]): any[] {
  return users.map((user) => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      birthDate: user.birthDate
    };
  });
}

describe("Many Users Query Test", function () {
  it("Tried to find many users in the database", async function () {
    const usersDB = generateUsers(5);
    const expectedUsers = getExpectedUsers(usersDB);

    await prisma.user.createMany({
      data: usersDB
    });

    const token = generateToken(1, false);
    const userQueryResponse = await serverRequest({ url, token, limit: 5 });
    expect(userQueryResponse.data.getManyUsers.users).to.be.deep.eq(expectedUsers);
  });

  it("Tried to find users without giving a limit", async function () {
    const usersDB = generateUsers(11);
    let expectedUsers = getExpectedUsers(usersDB);
    expectedUsers.sort((a, b) => a.name.localeCompare(b.name));
    expectedUsers = expectedUsers.slice(0, 10);

    await prisma.user.createMany({
      data: usersDB
    });

    const token = generateToken(1, false);

    const userQueryResponse = await serverRequest({ url, token });

    expect(userQueryResponse.data.getManyUsers.users.length).to.be.equal(defaultLimit);
    expect(userQueryResponse.data.getManyUsers.users).to.be.deep.eq(expectedUsers);
  });

  it("Tried to find user with an invalid token", async function () {
    await userSeed(7);

    const userQueryResponse = await serverRequest({ url, token: "invalidtoken123", limit: 5 });
    expect(userQueryResponse.errors).to.be.deep.eq([
      {
        code: 401,
        message: "Operação não autorizada"
      }
    ]);
  });

  it("Found the first page of users correctly", async function () {
    const usersDB = generateUsers(5);
    let expectedUsers = getExpectedUsers(usersDB);
    expectedUsers.sort((a, b) => a.name.localeCompare(b.name));
    expectedUsers = expectedUsers.slice(0, 3);

    await prisma.user.createMany({
      data: usersDB
    });

    const token = generateToken(1, false);

    const firstPageOfUsers = await serverRequest({ url, token, limit: 3, offset: 0 });
    expect(firstPageOfUsers.data.getManyUsers.users).to.be.deep.eq(expectedUsers);
  });

  it("Found the second page of users correctly", async function () {
    const usersDB = generateUsers(5);
    let expectedUsers = getExpectedUsers(usersDB);
    expectedUsers.sort((a, b) => a.name.localeCompare(b.name));
    expectedUsers = expectedUsers.slice(3, 5);

    await prisma.user.createMany({
      data: usersDB
    });

    const token = generateToken(1, false);
    const secondPageOfUsers = await serverRequest({ url, token, limit: 3, offset: 3 });
    expect(secondPageOfUsers.data.getManyUsers.users).to.be.deep.eq(expectedUsers);
  });

  it("Shold return the last page correctly", async function () {
    const usersDB = generateUsers(5);
    let expectedUsers = getExpectedUsers(usersDB);
    expectedUsers.sort((a, b) => a.name.localeCompare(b.name));
    expectedUsers = expectedUsers.slice(3, 5);

    await prisma.user.createMany({
      data: usersDB
    });

    const token = generateToken(1, false);
    const lastPageOfUsers = await serverRequest({ url, token, limit: 3, offset: 3 });

    expect(lastPageOfUsers.data.getManyUsers.hasMoreUsers).to.be.equal(false);
    expect(lastPageOfUsers.data.getManyUsers.users).to.be.deep.eq(expectedUsers);
  });

  it("Shold return users in alphabetical order", async function () {
    const usersDB = [
      { id: 4, name: "Davi", email: "user4@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 2, name: "Bruno", email: "user2@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 3, name: "Caio", email: "user3@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 5, name: "Eduardo", email: "user5@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 1, name: "Alan", email: "user1@example.com", password: "123abc", birthDate: "01-01-2000" }
    ];

    await prisma.user.createMany({
      data: usersDB
    });

    const expectedUsers = [
      { id: 2, name: "Bruno", email: "user2@example.com", birthDate: "01-01-2000" },
      { id: 3, name: "Caio", email: "user3@example.com", birthDate: "01-01-2000" },
      { id: 4, name: "Davi", email: "user4@example.com", birthDate: "01-01-2000" }
    ];

    const token = generateToken(1, false);
    const orderedUsers = await serverRequest({ url, token, limit: 3, offset: 1 });
    expect(orderedUsers.data.getManyUsers.users).to.be.deep.eq(expectedUsers);
  });

  it("Failed to find users with a negative limit", async function () {
    const token = generateToken(1, false);

    const userQueryResponse = await serverRequest({ url, token, limit: -1, offset: 0 });
    expect(userQueryResponse.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Algo deu errado, tente novamente",
        additionalInfo: "Offset e/ou limite precisam ser valores positivos."
      }
    ]);
  });

  it("Failed to find users with a negative offset", async function () {
    const token = generateToken(1, false);

    const userQueryResponse = await serverRequest({ url, token, limit: 1, offset: -1 });
    expect(userQueryResponse.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Algo deu errado, tente novamente",
        additionalInfo: "Offset e/ou limite precisam ser valores positivos."
      }
    ]);
  });
});
