import { url } from "../src/setup-server";
import { expect } from "chai";
import { prisma } from "../src/setup-db";
import { userSeed } from "../src/user-seed";
import { defaultLimit } from "../src/graphql/schema";
import { generateToken } from "../src/graphql/helpers/login-handlers";
import axios from "axios";

const getManyUsersPagination = `#graphql 
  query GetManyUsers ($offset: Int, $limit: Int) {
    getManyUsers(offset: $offset, limit: $limit) {
      totalCount
      hasMoreUsers
      users {
        id
        name
        email
        addresses {
          street
          streetNumber
          city
          zipCode
          state
      }
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

describe("Pagination Test", function () {
  it("Tried to find many users in the database", async function () {
    const usersDB = [
      { id: 1, name: "User 1", email: "user1@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 2, name: "User 2", email: "user2@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 3, name: "User 3", email: "user3@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 4, name: "User 4", email: "user4@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 5, name: "User 5", email: "user5@example.com", password: "123abc", birthDate: "01-01-2000" }
    ];

    await prisma.user.createMany({
      data: usersDB
    });

    const expectedUsers = [
      { id: 1, name: "User 1", email: "user1@example.com", addresses: [] },
      { id: 2, name: "User 2", email: "user2@example.com", addresses: [] },
      { id: 3, name: "User 3", email: "user3@example.com", addresses: [] },
      { id: 4, name: "User 4", email: "user4@example.com", addresses: [] },
      { id: 5, name: "User 5", email: "user5@example.com", addresses: [] }
    ];

    const token = generateToken(1, false);
    const userQueryResponse = await serverRequest({ url, token, limit: 5 });
    expect(userQueryResponse.data.getManyUsers.users).to.be.deep.eq(expectedUsers);
  });

  it("Tried to find many users in the database with addresses", async function () {
    const usersDB = [
      {
        id: 1,
        name: "User 1",
        email: "user1@example.com",
        password: "123abc",
        birthDate: "01-01-2000"
      },
      {
        id: 2,
        name: "User 2",
        email: "user2@example.com",
        password: "123abc",
        birthDate: "01-01-2000"
      }
    ];

    await prisma.user.createMany({
      data: usersDB
    });
    const addressesDB = [
      {
        id: 1,
        zipCode: 123456789,
        street: "Street 1",
        streetNumber: 1,
        city: "City 1",
        state: "State 1",
        userID: 1
      },
      {
        id: 2,
        zipCode: 123456789,
        street: "Street 2",
        streetNumber: 2,
        city: "City 2",
        state: "State 2",
        userID: 2
      }
    ];

    await prisma.address.createMany({
      data: addressesDB
    });

    const expectedUsers = [
      {
        id: 1,
        name: "User 1",
        email: "user1@example.com",
        addresses: [{ street: "Street 1", streetNumber: 1, city: "City 1", zipCode: 123456789, state: "State 1" }]
      },
      {
        id: 2,
        name: "User 2",
        email: "user2@example.com",
        addresses: [{ street: "Street 2", streetNumber: 2, city: "City 2", zipCode: 123456789, state: "State 2" }]
      }
    ];

    const token = generateToken(1, false);
    const userQueryResponse = await serverRequest(url, token, 3);
    expect(userQueryResponse.data.getManyUsers.users).to.be.deep.eq(expectedUsers);

    await prisma.address.deleteMany({});
  });

  it("Tried to find users without giving a limit", async function () {
    const usersDB = [
      { id: 1, name: "User 1", email: "user1@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 2, name: "User 2", email: "user2@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 3, name: "User 3", email: "user3@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 4, name: "User 4", email: "user4@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 5, name: "User 5", email: "user5@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 6, name: "User 6", email: "user6@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 7, name: "User 7", email: "user7@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 8, name: "User 8", email: "user8@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 9, name: "User 9", email: "user9@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 10, name: "User 10", email: "user10@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 11, name: "User 11", email: "user11@example.com", password: "123abc", birthDate: "01-01-2000" }
    ];

    await prisma.user.createMany({
      data: usersDB
    });

    const expectedUsers = [
      { id: 1, name: "User 1", email: "user1@example.com" },
      { id: 10, name: "User 10", email: "user10@example.com" },
      { id: 11, name: "User 11", email: "user11@example.com" },
      { id: 2, name: "User 2", email: "user2@example.com" },
      { id: 3, name: "User 3", email: "user3@example.com" },
      { id: 4, name: "User 4", email: "user4@example.com" },
      { id: 5, name: "User 5", email: "user5@example.com" },
      { id: 6, name: "User 6", email: "user6@example.com" },
      { id: 7, name: "User 7", email: "user7@example.com" },
      { id: 8, name: "User 8", email: "user8@example.com" }
    ];

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
    const usersDB = [
      { id: 1, name: "User 1", email: "user1@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 2, name: "User 2", email: "user2@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 3, name: "User 3", email: "user3@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 4, name: "User 4", email: "user4@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 5, name: "User 5", email: "user5@example.com", password: "123abc", birthDate: "01-01-2000" }
    ];

    await prisma.user.createMany({
      data: usersDB
    });

    const expectedUsers = [
      { id: 1, name: "User 1", email: "user1@example.com", addresses: [] },
      { id: 2, name: "User 2", email: "user2@example.com", addresses: [] },
      { id: 3, name: "User 3", email: "user3@example.com", addresses: [] }
    ];

    const token = generateToken(1, false);

    const firstPageOfUsers = await serverRequest({ url, token, limit: 3, offset: 0 });
    expect(firstPageOfUsers.data.getManyUsers.users).to.be.deep.eq(expectedUsers);
  });

  it("Found the second page of users correctly", async function () {
    const usersDB = [
      { id: 1, name: "User 1", email: "user1@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 2, name: "User 2", email: "user2@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 3, name: "User 3", email: "user3@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 4, name: "User 4", email: "user4@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 5, name: "User 5", email: "user5@example.com", password: "123abc", birthDate: "01-01-2000" }
    ];

    const test = await prisma.user.createMany({
      data: usersDB
    });

    const expectedUsers = [
      { id: 4, name: "User 4", email: "user4@example.com", addresses: [] },
      { id: 5, name: "User 5", email: "user5@example.com", addresses: [] }
    ];

    const token = generateToken(1, false);
    const secondPageOfUsers = await serverRequest({ url, token, limit: 3, offset: 3 });
    expect(secondPageOfUsers.data.getManyUsers.users).to.be.deep.eq(expectedUsers);
  });

  it("Shold return the last page correctly", async function () {
    const usersDB = [
      { id: 1, name: "User 1", email: "user1@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 2, name: "User 2", email: "user2@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 3, name: "User 3", email: "user3@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 4, name: "User 4", email: "user4@example.com", password: "123abc", birthDate: "01-01-2000" },
      { id: 5, name: "User 5", email: "user5@example.com", password: "123abc", birthDate: "01-01-2000" }
    ];

    await prisma.user.createMany({
      data: usersDB
    });

    const token = generateToken(1, false);
    const lastPageOfUsers = await serverRequest({ url, token, limit: 3, offset: 3 });

    const expectedUsers = [
      { id: 4, name: "User 4", email: "user4@example.com" },
      { id: 5, name: "User 5", email: "user5@example.com" }
    ];

    expect(lastPageOfUsers.data.getManyUsers.hasMoreUsers).to.be.equal(false);
    expect(lastPageOfUsers.data.getManyUsers.users).to.be.deep.eq(expectedUsers);
  });

  it("Returned users in alphabetical order", async function () {
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
      { id: 2, name: "Bruno", email: "user2@example.com", addresses: [] },
      { id: 3, name: "Caio", email: "user3@example.com", addresses: [] },
      { id: 4, name: "Davi", email: "user4@example.com", addresses: [] }
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

