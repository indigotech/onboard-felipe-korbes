import { url } from "../src/setup-server";
import { prisma } from "../src/setup-db";
import { describe, it } from "mocha";
import { assert, expect } from "chai";
import { hashPassword, loginUserMutation } from "./helpers/helpers";
import axios from "axios";

describe("Login authentication tests", function () {
  it("Logged in successfully", async function () {
    const hashedPassword = await hashPassword("123abc");

    await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: hashedPassword,
        birthDate: "01-01-2000"
      }
    });

    const response = await axios.post(url, {
      query: loginUserMutation({
        email: "test@example.com",
        password: "123abc"
      })
    });

    const createdUserDB = await prisma.user.findUnique({
      where: {
        email: "test@example.com"
      }
    });

    const expectedResponse = {
      user: {
        id: createdUserDB?.id.toString(),
        name: "User Test",
        email: "test@example.com",
        birthDate: "01-01-2000"
      },
      token: "tokenTest"
    };

    const userResponse = response.data.data.login;
    expect(userResponse).to.be.deep.eq(expectedResponse);

    assert.equal(response.data.data.login.token, "tokenTest");
  });

  it("Failed to login with the wrong password", async function () {
    const hashedPassword = await hashPassword("123abc");

    await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: hashedPassword,
        birthDate: "01-01-2000"
      }
    });

    const response = await axios.post(url, {
      query: loginUserMutation({
        email: "test@example.com",
        password: "123abc1"
      })
    });

    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Wrong password and/or email"
      }
    ]);
  });

  it("Failed to login with a non existing email", async function () {
    const hashedPassword = await hashPassword("123abc");

    await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: hashedPassword,
        birthDate: "01-01-2000"
      }
    });

    const createdUserDB = await prisma.user.findUnique({
      where: {
        email: "test@example.com"
      }
    });

    const response = await axios.post(url, {
      query: loginUserMutation({
        email: "test1@example.com",
        password: "123abc"
      })
    });

    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: `User with email test1@example.com not found`
      }
    ]);
  });
});
