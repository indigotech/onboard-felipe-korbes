import { url } from "../src/setup-server";
import { expect } from "chai";
import { userSeed } from "../src/user-seed";
import { generateToken } from "../src/graphql/helpers/login-handlers";
import { defaultSearchValue } from "../src/graphql/resolvers";
import axios from "axios";

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
    await userSeed(7);

    const token = generateToken(1, false);

    const userQueryResponse = await serverRequest(url, token, 5);
    expect(userQueryResponse.data.getManyUsers.length).to.be.equal(5);
  });

  it("Tried to find users without giving a limit", async function () {
    await userSeed(defaultSearchValue + 5);

    const token = generateToken(1, false);

    const userQueryResponse = await serverRequest(url, token);
    expect(userQueryResponse.data.getManyUsers.length).to.be.equal(defaultSearchValue);
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
