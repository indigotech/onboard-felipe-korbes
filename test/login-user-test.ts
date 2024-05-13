import { url } from "../src/setup-server";
import { prisma } from "../src/setup-db";
import { verifyToken } from "./helpers/helpers";
import { hashPassword } from "../src/graphql/resolvers";
import { expect } from "chai";
import { loginUserMutation } from "./helpers/test-queries";
import axios from "axios";

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

    const token = response.data.data.login.token;
    const expectedResponse = {
      user: {
        id: userDB?.id,
        name: "User Test",
        email: "test@example.com",
        birthDate: "01-01-2000"
      },
      token
    };

    const userResponse = response.data.data.login;
    expect(userResponse).to.be.deep.eq(expectedResponse);

    const decodedToken = verifyToken(token);

    const expectedTokenResponse = {
      id: decodedToken.id,
      email: decodedToken.email
    };

    expect(decodedToken).to.include(expectedTokenResponse);
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
