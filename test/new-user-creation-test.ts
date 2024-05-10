import { describe, before, it, after } from "mocha"; // Mocha imports
import { expect, assert } from "chai";
import { setup } from "../src/setup";
import { prisma } from "../src/setup-db";
import { server, url } from "../src/setup-server";
import axios from "axios";

describe("User creation test", function () {
  before(async function () {
    console.log("Starting setup");
    await setup();
    console.log("Setup complete");
  });

  it("Created a new user with a mutation, checked their existence and deleted it", async function () {
    const usersBefore = await prisma.user.findMany();
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
    const usersAfter = await prisma.user.findMany();

    const expectedUser = {
      name: "User Test",
      email: "test@example.com",
      birthDate: "01-01-2000"
    };

    const createdUser = await prisma.user.findUnique({
      where: {
        email: "test@example.com"
      }
    });

    expect(createdUser).to.not.be.null;
    if (createdUser) {
      expect(createdUser.email).to.be.equal("test@example.com");
      expect(createdUser.name).to.be.equal("User Test");
      expect(createdUser.birthDate).to.be.equal("01-01-2000");
    }
    expect(usersAfter.length).to.be.greaterThan(usersBefore.length);
    expect({
      name: response.data.data.createUser.name,
      email: response.data.data.createUser.email,
      birthDate: response.data.data.createUser.birthDate
    }).to.be.deep.eq(expectedUser);

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
