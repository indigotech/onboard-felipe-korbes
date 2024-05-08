import { describe, before, it, after } from "mocha"; // Mocha imports
import { expect, assert } from "chai";
import { setup } from "../src/setup";
import { prisma } from "../src/setup-db";
import { server, url } from "../src/setup-server";
import axios from "axios";

describe("GraphQL Server Test", function () {
  before(async function () {
    console.log("Starting setup");
    await setup();
    console.log("Setup complete");
  });

  it("Returned 'Hello world!' from the hello query", async function () {
    const response = await axios.post(url, {
      query: "{ hello }"
    });

    assert.equal(response.data.data.hello, "Hello world!");
  });

  it("Created a new user with a mutation", async function () {
    const response = await axios.post(url, {
      query: `
          mutation {
            createUser(data: {
              name: "User Test",
              email: "test@example.com",
              password: "123abc",
              birthDate: "01-01-2000"
            }) {
              id
              name
              email
              birthDate
            }
          }
        `
    });

    expect(response.data).to.have.property("data");
    expect(response.data.data).to.have.property("createUser");
    expect(response.data.data.createUser).to.not.be.null;
    expect(response.data.data.createUser.id).to.not.be.null;
    assert.equal(response.data.data.createUser.name, "User Test");
    assert.equal(response.data.data.createUser.email, "test@example.com");
    assert.equal(response.data.data.createUser.birthDate, "01-01-2000");
  });

  it("Found the newly created user", async function () {
    const createdUser = await prisma.user.findUnique({
      where: {
        email: "test@example.com"
      }
    });
    expect(createdUser).to.not.be.null;
    if (createdUser) {
      expect(createdUser.email).to.be.equal("test@example.com");
    }
  });

  it("Deleted the newly created user", async function () {
    const deletedUser = await prisma.user.delete({
      where: {
        email: "test@example.com"
      }
    });
    assert.equal(deletedUser.email, "test@example.com");
  });

  after(async function () {
    await server.stop();
  });
});
