import { url } from "../src/setup-server";
import { expect } from "chai";
import { userSeed } from "../src/user-seed";
import { generateToken } from "../src/graphql/helpers/login-handlers";
import { defaultSearchValue } from "../src/graphql/resolvers";
import axios from "axios";

const getManyUsersPagination = `#graphql 
  query GetManyUsers ($offset: Int, $limit: Int) {
    getManyUsers(offset: $offset, limit: $limit) {
      totalCount
      users {
        id
        name
        email
      }
    }
  }`;

async function serverRequest(url: string, token: string, limit?: number, offset?: number) {
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

describe("Many Users Query Test", function () {
  it("Tried to find many users in the database", async function () {
    await userSeed(7);

    const token = generateToken(1, false);

    const userQueryResponse = await serverRequest(url, token, 5);
    expect(userQueryResponse.data.getManyUsers.users.length).to.be.equal(5);
  });

  it("Tried to find users without giving a limit", async function () {
    await userSeed(defaultSearchValue + 5);

    const token = generateToken(1, false);

    const userQueryResponse = await serverRequest(url, token);
    expect(userQueryResponse.data.getManyUsers.users.length).to.be.equal(defaultSearchValue);
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

  it("Paginated between users", async function () {
    await userSeed(9);

    const token = generateToken(1, false);

    const firstPageOfUsers = await serverRequest(url, token, 3, 0);
    expect(firstPageOfUsers.data.getManyUsers.users.length).to.be.equal(3);

    const secondPageOfUsers = await serverRequest(url, token, 3, 3);
    expect(secondPageOfUsers.data.getManyUsers.users.length).to.be.equal(3);

    expect(firstPageOfUsers.data.getManyUsers.users).to.not.deep.equal(secondPageOfUsers.data.getManyUsers.users);

    let isAscending = false;
    for (let i = 0; i < firstPageOfUsers.data.getManyUsers.users.length - 1; i++) {
      if (
        firstPageOfUsers.data.getManyUsers.users[i].name.localeCompare(
          firstPageOfUsers.data.getManyUsers.users[i + 1].name
        ) > 0 ||
        secondPageOfUsers.data.getManyUsers.users[i].name.localeCompare(
          secondPageOfUsers.data.getManyUsers.users[i + 1].name
        ) > 0
      ) {
        break;
      } else {
        isAscending = true;
      }
    }
    expect(isAscending).to.be.true;

    expect(firstPageOfUsers.data.getManyUsers.totalCount).to.be.equal(9);
    expect(secondPageOfUsers.data.getManyUsers.totalCount).to.be.equal(9);
  });

  it("Failed to find users with a negative limit", async function () {
    const token = generateToken(1, false);

    const userQueryResponse = await serverRequest(url, token, -1, 0);
    expect(userQueryResponse.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Offset e/ou limite precisam ser valores positivos."
      }
    ]);
  });

  it("Failed to find users with a negative offset", async function () {
    const token = generateToken(1, false);

    const userQueryResponse = await serverRequest(url, token, 1, -1);
    expect(userQueryResponse.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Offset e/ou limite precisam ser valores positivos."
      }
    ]);
  });
});
