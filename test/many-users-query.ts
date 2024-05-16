import { url } from "../src/setup-server";
import { expect } from "chai";
import { userSeed } from "../src/user-seed";
import { generateToken } from "../src/graphql/helpers/login-handlers";
import { defaultLimit } from "../src/graphql/schema";
import axios from "axios";
import { prisma } from "../src/setup-db";

const getManyUsers = `#graphql 
  query GetManyUsers ($limit: Int) {
    getManyUsers(limit: $limit) {
      id
      name
      email
    }
  }`;

async function serverRequest(url: string, token: string, limit?: number) {
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

describe("Many Users Query Test", function () {
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
      { id: 1, name: "User 1", email: "user1@example.com" },
      { id: 2, name: "User 2", email: "user2@example.com" },
      { id: 3, name: "User 3", email: "user3@example.com" },
      { id: 4, name: "User 4", email: "user4@example.com" },
      { id: 5, name: "User 5", email: "user5@example.com" }
    ];

    const token = generateToken(1, false);

    const userQueryResponse = await serverRequest(url, token, 5);
    expect(userQueryResponse.data.getManyUsers.length).to.be.equal(5);
    expect(userQueryResponse.data.getManyUsers).to.be.deep.eq(expectedUsers);
  });

  it("Tried to find users without giving a limit", async function () {
    await userSeed(defaultLimit + 5);
    const token = generateToken(1, false);

    const userQueryResponse = await serverRequest(url, token);
    expect(userQueryResponse.data.getManyUsers.length).to.be.equal(defaultLimit);
  });

  it("Tried to find user with an invalid token", async function () {
    await userSeed(7);

    const userQueryResponse = await serverRequest(url, "invalidtoken123", 5);
    expect(userQueryResponse.errors).to.be.deep.eq([
      {
        code: 401,
        message: "Operação não autorizada"
      }
    ]);
  });
});
