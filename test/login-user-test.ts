import { describe, it } from "mocha";
import { assert, expect } from "chai";
import { url } from "../src/setup-server";
import axios from "axios";

describe("Hello Query Test", function () {
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

    expect({
      id: response.data.data.login.user.id,
      name: response.data.data.login.user.name,
      email: response.data.data.login.user.email,
      birthDate: response.data.data.login.user.birthDate
    }).to.be.deep.eq(expectedUser);

    assert.equal(response.data.data.login.token, "tokenTest");
  });
});
