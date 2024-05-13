import { url } from "../src/setup-server";
import { expect } from "chai";
import { prisma } from "../src/setup-db";
import { describe, it } from "mocha";
import { createUserMutation } from "./helpers/helpers";
import axios from "axios";

describe("User creation test", function () {
  it("Created a new user", async function () {
    const response = await axios.post(url, {
      query: createUserMutation({
        name: "User Test",
        email: "test@example.com",
        password: "123abc",
        birthDate: "01-01-2000"
      })
    });

    const createdUserDB = await prisma.user.findUnique({
      where: {
        email: "test@example.com"
      }
    });

    const expectedUser = {
      id: createdUserDB?.id.toString(),
      name: "User Test",
      email: "test@example.com",
      birthDate: "01-01-2000"
    };

    expect(createdUserDB).to.not.be.null;
    if (createdUserDB) {
      expect(createdUserDB.email).to.be.equal("test@example.com");
      expect(createdUserDB.name).to.be.equal("User Test");
      expect(createdUserDB.birthDate).to.be.equal("01-01-2000");
    }

    const userResponse = response.data.data.createUser;
    expect(userResponse).to.be.deep.eq(expectedUser);
  });

  it("Tried to create a new user with an already existing email and failed", async function () {
    await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: "123abc"
      }
    });

    const createdUserDB = await prisma.user.findUnique({
      where: {
        email: "test@example.com"
      }
    });

    expect(createdUserDB).to.not.be.null;

    const response = await axios.post(url, {
      query: createUserMutation({
        name: "User Test",
        email: "test@example.com",
        password: "123abc",
        birthDate: "01-01-2000"
      })
    });

    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Email already taken, please use a different email"
      }
    ]);
  });

  it("Tried to create a new user with a password less than 6 digits and failed", async function () {
    const response = await axios.post(url, {
      query: createUserMutation({
        name: "User Test",
        email: "test1@example.com",
        password: "abc",
        birthDate: "01-01-2000"
      })
    });

    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Password must be at least 6 characters long"
      }
    ]);
  });

  it("Tried to create a new user with a password containing only letters and failed", async function () {
    const response = await axios.post(url, {
      query: createUserMutation({
        name: "User Test",
        email: "test1@example.com",
        password: "abcdef",
        birthDate: "01-01-2000"
      })
    });
    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Password must contain at least one letter and one number"
      }
    ]);
  });

  it("Tried to create a new user with a password containing only numbers and failed", async function () {
    const response = await axios.post(url, {
      query: createUserMutation({
        name: "User Test",
        email: "test1@example.com",
        password: "123456",
        birthDate: "01-01-2000"
      })
    });
    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Password must contain at least one letter and one number"
      }
    ]);
  });

  it("Tried to create a new user with a wrongly formatted birthdate and failed", async function () {
    const response = await axios.post(url, {
      query: createUserMutation({
        name: "User Test",
        email: "test1@example.com",
        password: "123abc",
        birthDate: "01-01-200"
      })
    });
    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Invalid birth date. Birth date must be in the format DD-MM-YYYY"
      }
    ]);
  });

  it("Tried to create a new user with a invalid birthdate and failed", async function () {
    const response = await axios.post(url, {
      query: createUserMutation({
        name: "User Test",
        email: "test1@example.com",
        password: "123abc",
        birthDate: "01-01-200"
      })
    });
    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Invalid birth date. Birth date must be in the format DD-MM-YYYY"
      }
    ]);
  });

  it("Tried to create a new user with a invalid birthdate year and failed", async function () {
    const response = await axios.post(url, {
      query: createUserMutation({
        name: "User Test",
        email: "test1@example.com",
        password: "123abc",
        birthDate: "01-01-1889"
      })
    });

    const now = new Date();
    const currentYear = now.getFullYear();

    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Invalid year. Year must be in the range 1900 - " + currentYear
      }
    ]);
  });
});
