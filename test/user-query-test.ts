import { url } from "../src/setup-server";
import { expect } from "chai";
import { prisma } from "../src/setup-db";
import { hashPassword } from "../src/graphql/resolvers";
import { generateToken } from "../src/graphql/helpers/login-handlers";
import { createUserMutation, getUserByID } from "./test-queries";
import axios from "axios";

describe("User Query Test", function () {
  it("Found a user", async function () {
    const hashedPassword = await hashPassword("123abc");

    const userDB = await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: hashedPassword,
        birthDate: "01-01-2000"
      }
    });

    const token = generateToken({ id: userDB.id, email: userDB.email }, false);
    const userQueryResponse = await axios.post(
      url,
      {
        query: getUserByID,
        variables: {
          id: userDB.id
        }
      },
      {
        headers: {
          Authorization: token
        }
      }
    );

    const expectedUserDB = {
      id: userDB?.id,
      name: userDB?.name,
      email: userDB?.email,
      birthDate: userDB?.birthDate
    };

    expect(expectedUserDB).to.be.deep.eq(userQueryResponse.data.data.getUser);
  });

  it("Failed to find a user with an invalid id", async function () {
    const hashedPassword = await hashPassword("123abc");

    const userDB = await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: hashedPassword,
        birthDate: "01-01-2000"
      }
    });

    const token = generateToken({ id: userDB.id, email: userDB.email }, false);
    const userQueryResponse = await axios.post(
      url,
      {
        query: getUserByID,
        variables: {
          id: 1
        }
      },
      {
        headers: {
          Authorization: token
        }
      }
    );

    expect(userQueryResponse.data.errors).to.be.deep.eq([
      {
        code: 404,
        message: "Usuário não encontrado"
      }
    ]);
  });

  it("Failed to find a user with an invalid token", async function () {
    const hashedPassword = await hashPassword("123abc");

    const userDB = await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: hashedPassword,
        birthDate: "01-01-2000"
      }
    });

    const token = generateToken({ id: userDB.id, email: userDB.email }, false);
    const userQueryResponse = await axios.post(
      url,
      {
        query: getUserByID,
        variables: {
          id: userDB.id
        }
      },
      {
        headers: {
          Authorization: "invalidToken123"
        }
      }
    );

    expect(userQueryResponse.data.errors).to.be.deep.eq([
      {
        code: 401,
        message: "Operação não autorizada"
      }
    ]);
  });
});
