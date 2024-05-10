import { url } from "../src/setup-server";
import { prisma } from "../src/setup-db";
import { assert, expect } from "chai";
import { loginUserMutation, verifyToken } from "./helpers/helpers";
import axios from "axios";
import { hashPassword } from "../src/graphql/helpers/helpers";

describe("Login authentication tests", function () {
  it("Logged in successfully", async function () {
    const hashedPassword = await hashPassword("123abc");

    const userDB = await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: hashedPassword,
        birthDate: "01-01-2000"
      }
    });

    const response = await axios.post(url, {
      query: loginUserMutation,
      variables: {
        data: {
          email: "test@example.com",
          password: "123abc"
        }
      }
    });

    const expectedResponse = {
      user: {
        id: userDB?.id.toString(),
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
      query: loginUserMutation,
      variables: {
        data: {
          email: "test@example.com",
          password: "123abc1"
        }
      }
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

    const response = await axios.post(url, {
      query: loginUserMutation,
      variables: {
        data: {
          email: "test1@example.com",
          password: "123abc1"
        }
      }
    });

    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: `User with email test1@example.com not found`
      }
    ]);
  });
});
