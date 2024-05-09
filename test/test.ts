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

  it("Created a new user with a mutation, checked their existence and deleted it", async function () {
    const usersBefore = await prisma.user.findMany();
    const response = await axios.post(url, {
      query: `#graphql
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

  it("Tried to create a new user with an already existing email and failed", async function () {
    const response = await axios.post(url, {
      query: `#graphql
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
    assert.equal(response.data.errors[0].code, 400);
    assert.equal(response.data.errors[0].message, "Email already taken, please use a different email");
  });

  it("Tried to create a new user with a password less than 6 digits and failed", async function () {
    const response = await axios.post(url, {
      query: `#graphql
          mutation {
            createUser(data: {
              name: "User Test",
              email: "test1@example.com",
              password: "abc",
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
    assert.equal(response.data.errors[0].code, 400);
    assert.equal(response.data.errors[0].message, "Password must be at least 6 characters long");
  });

  it("Tried to create a new user with a password containing only letters and failed", async function () {
    const response = await axios.post(url, {
      query: `#graphql
          mutation {
            createUser(data: {
              name: "User Test",
              email: "test1@example.com",
              password: "abcdef",
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
    assert.equal(response.data.errors[0].code, 400);
    assert.equal(response.data.errors[0].message, "Password must contain at least one letter and one number");
  });

  it("Tried to create a new user with a password containing only numbers and failed", async function () {
    const response = await axios.post(url, {
      query: `#graphql
          mutation {
            createUser(data: {
              name: "User Test",
              email: "test1@example.com",
              password: "123456",
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
    assert.equal(response.data.errors[0].code, 400);
    assert.equal(response.data.errors[0].message, "Password must contain at least one letter and one number");
  });

  it("Tried to create a new user with a wrongly formatted birthdate and failed", async function () {
    const response = await axios.post(url, {
      query: `#graphql
          mutation {
            createUser(data: {
              name: "User Test",
              email: "test1@example.com",
              password: "123abc",
              birthDate: "01-01-100"
            }) {
              id
              name
              email
              birthDate
            }
          }
        `
    });
    assert.equal(response.data.errors[0].code, 400);
    assert.equal(response.data.errors[0].message, "Invalid birth date. Birth date must be in the format DD-MM-YYYY");
  });

  it("Tried to create a new user with a invalid birthdate and failed", async function () {
    const response = await axios.post(url, {
      query: `#graphql
          mutation {
            createUser(data: {
              name: "User Test",
              email: "test1@example.com",
              password: "123456s",
              birthDate: "01-13-2001"
            }) {
              id
              name
              email
              birthDate
            }
          }
        `
    });
    assert.equal(response.data.errors[0].code, 400);
    assert.equal(response.data.errors[0].message, "Invalid birth date. Birth date must be in the format DD-MM-YYYY");
  });

  it("Tried to create a new user with a invalid birthdate year and failed", async function () {
    const response = await axios.post(url, {
      query: `#graphql
          mutation {
            createUser(data: {
              name: "User Test",
              email: "test1@example.com",
              password: "123abc",
              birthDate: "01-12-1889" 
            }) {
              id
              name
              email
              birthDate
            }
          }
        `
    });

    const now = new Date();
    const currentYear = now.getFullYear();

    assert.equal(response.data.errors[0].code, 400);
    assert.equal(response.data.errors[0].message, "Invalid year. Year must be in the range 1900 - " + currentYear);
  });

  after(async function () {
    await server.stop();
  });
});
