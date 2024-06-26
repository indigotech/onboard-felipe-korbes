import { url } from "../src/setup-server";
import { prisma } from "../src/setup-db";
import { expect } from "chai";
import { verifyToken } from "../src/graphql/helpers/authentication-handler";
import { hashPassword } from "../src/graphql/resolvers";
import { longExpiration, shortExpiration } from "../src/graphql/helpers/login-handlers";
import axios from "axios";

const loginUserMutation = `#graphql
  mutation Login ($data: LoginInput!) {
    login(data: $data) {
      user {
        id
        name
        email
        birthDate
      }
      token
    }
  }`;

interface serverRequestParams {
  url: string;
  email: string;
  password: string;
  rememberMe: boolean;
}

async function serverRequest(params: serverRequestParams) {
  const { url, email, password, rememberMe } = params;
  const response = await axios.post(url, {
    query: loginUserMutation,
    variables: {
      data: {
        email: email,
        password: password,
        rememberMe: rememberMe
      }
    }
  });
  return response.data;
}

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

    const response = await serverRequest({ url, email: userDB.email, password: "123abc", rememberMe: true });

    const token = response.data.login.token;
    const expectedResponse = {
      user: {
        id: userDB?.id,
        name: "User Test",
        email: "test@example.com",
        birthDate: "01-01-2000"
      },
      token
    };

    const userResponse = response.data.login;
    expect(userResponse).to.be.deep.eq(expectedResponse);

    const decodedToken = verifyToken(token);

    const expiration: number = decodedToken ? decodedToken.exp - decodedToken.iat : -1;
    expect(decodedToken).to.include({ id: decodedToken?.id });
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

    const response = await serverRequest({ url, email: userDB.email, password: "123abc", rememberMe: false });

    const token = response.data.login.token;
    const expectedResponse = {
      user: {
        id: userDB?.id,
        name: "User Test",
        email: "test@example.com",
        birthDate: "01-01-2000"
      },
      token
    };

    expect(response.data.login).to.be.deep.eq(expectedResponse);

    const decodedToken = verifyToken(token);
    const expiration: number = decodedToken ? decodedToken.exp - decodedToken.iat : -1;

    expect(decodedToken).to.include({ id: decodedToken?.id });
    expect(expiration).to.be.eq(parseInt(shortExpiration));
  });

  it("Failed to login with the wrong password", async function () {
    const hashedPassword = await hashPassword("123abc");

    const userDB = await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: hashedPassword,
        birthDate: "01-01-2000"
      }
    });

    const response = await serverRequest({ url, email: userDB.email, password: "123abc1", rememberMe: true });

    expect(response.errors).to.be.deep.eq([
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

    const response = await serverRequest({ url, email: "test1@example.com", password: "123abc", rememberMe: true });

    expect(response.errors).to.be.deep.eq([
      {
        code: 400,
        message: `Usuário com email test1@example.com não encontrado`
      }
    ]);
  });
});
