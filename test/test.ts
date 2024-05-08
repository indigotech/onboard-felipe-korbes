import axios from "axios";
import { describe, before, it, after } from "mocha"; // Mocha imports
import { expect, assert } from "chai";
import { setup } from "../src/setup";
import { prisma } from "../src/setup-db";
import { server } from "../src/setup-server";

describe("GraphQL Server Test", function () {
  let serverUrl: string;

  before(async function () {
    console.log("Starting setup");
    await setup();
    console.log("Setup complete");
  });

  it("should return 'Hello world!' from the hello query", async function () {
    const response = await axios.post(serverUrl, {
      query: "{ hello }"
    });

    assert.equal(response.data.data.hello, "Hello world!");
  });

  it("should try to create a new user with a mutation", async function () {
    const response = await axios.post(serverUrl, {
      mutation: `
        mutation {
          createUser(data: {
            name: "User Test",
            email: "test@example.com",
            password: "abcedf",
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

    response.data.createUser.id.should.not.be.null;
    assert.equal(response.data.createUser.name, "User Test");
    assert.equal(response.data.createUser.email, "test@example.com");
    assert.equal(response.data.createUser.birthDate, "01-01-2000");
  });

  it("should try to find the newly created user", async function () {
    const createdUser = await prisma.user.findUnique({
      where: {
        email: "test@example.com"
      }
    });
    expect(createdUser).to.not.be.null;
    if (createdUser) {
      createdUser.email.should.equal("test@example.com");
    }
  });

  it("should try to delete the newly created user", async function () {
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
