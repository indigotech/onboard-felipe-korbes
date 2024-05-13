import { describe, it } from "mocha";
import { assert, expect } from "chai";
import { url } from "../src/setup-server";
import axios from "axios";

describe("Login test", function () {
  it("Tried a mock login attempt", async function () {
    const response = await axios.post(url, {
      query: `#graphql
          mutation {
            login(data: {
              email: "felipe@example.com",
              password: "123abc"
            }) {
              user {
                id
                name
                email
                birthDate
              }
              token
            }
          }
        `
    });

    const expectedUser = {
      id: "37",
      name: "Test Login",
      email: "login@email.com",
      birthDate: "01-01-2000"
    };

    expect(response.data.data.login.user).to.be.deep.eq(expectedUser);

    assert.equal(response.data.data.login.token, "tokenTest");
  });
});
