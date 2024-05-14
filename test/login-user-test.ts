import { url } from "../src/setup-server";
import { prisma } from "../src/setup-db";
import { verifyToken } from "./helpers/helpers";
import { hashPassword } from "../src/graphql/resolvers";
import { expect } from "chai";
import { loginUserMutation } from "./helpers/test-queries";
import axios from "axios";
import { longExpiration, shortExpiration } from "../src/graphql/helpers/login-handlers";

describe("Login authentication tests", function () {
  it("Logged in successfully with remember me checked (long token duration)", async function () {
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
          password: "123abc",
          rememberMe: true
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

    const expiration: number = decodedToken.exp - decodedToken.iat;
    expect(decodedToken).to.include(expectedTokenResponse);
    expect(expiration).to.be.eq(parseInt(longExpiration));
  });

  it("Logged in successfully with remember me not checked (short token duration)", async function () {
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
          password: "123abc",
          rememberMe: false
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
    const expiration: number = decodedToken.exp - decodedToken.iat;

    const expectedTokenResponse = {
      id: decodedToken.id
    };
    expect(decodedToken).to.include(expectedTokenResponse);
    expect(expiration).to.be.eq(parseInt(shortExpiration));
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
          password: "123abc1",
          rememberMe: true
        }
      }
    });

    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Senha e/ou email incorretos"
      }
    ]);
  });

  it("Failed to login with a non existing email", async function () {
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
          email: "test1@example.com",
          password: "123abc",
          rememberMe: true
        }
      }
    });

    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: `Usuário com email test1@example.com não encontrado`
      }
    ]);
  });
});
