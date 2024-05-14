import { url } from "../src/setup-server";
import { expect } from "chai";
import { prisma } from "../src/setup-db";
import { hashPassword } from "../src/graphql/resolvers";
import { generateToken } from "../src/graphql/helpers/login-handlers";
import axios from "axios";

const createUserMutation = `#graphql
  mutation CreateUser ($data: UserInput!) {
    createUser(data: $data) {
      id
      name
      email
      birthDate
    }
  }`;

interface serverRequestParams {
  url: string;
  name: string;
  email: string;
  password: string;
  birthDate: string;
  token: string;
}

async function serverRequest(params: serverRequestParams) {
  const { url, name, email, password, birthDate, token } = params;
  const response = await axios.post(
    url,
    {
      query: createUserMutation,
      variables: {
        data: {
          name: name,
          email: email,
          password: password,
          birthDate: birthDate
        }
      }
    },
    {
      headers: {
        Authorization: token
      }
    }
  );
  return response.data;
}

describe("User creation test", function () {
  it("Created a new user successfully", async function () {
    const token = generateToken(1, false);

    const response = await serverRequest({
      url,
      name: "User Mutation Test",
      email: "mutation@example.com",
      password: "123abc",
      birthDate: "01-01-2000",
      token
    });

    const createdUserDB = await prisma.user.findUnique({
      where: {
        email: "mutation@example.com"
      }
    });

    const expectedUserDB = {
      id: createdUserDB?.id,
      password: createdUserDB?.password,
      name: "User Mutation Test",
      email: "mutation@example.com",
      birthDate: "01-01-2000",
      age: null
    };

    expect(createdUserDB).to.be.deep.eq(expectedUserDB);

    const expectedUserResponse = {
      id: createdUserDB?.id,
      name: "User Mutation Test",
      email: "mutation@example.com",
      birthDate: "01-01-2000"
    };

    expect(response.data.createUser).to.be.deep.eq(expectedUserResponse);
  });

  it("Failed to create a new user with an invalid token", async function () {
    const response = await serverRequest({
      url,
      name: "User Mutation Test",
      email: "mutation@example.com",
      password: "123abc",
      birthDate: "01-01-2000",
      token: "invalid-token-123"
    });

    expect(response.errors).to.be.deep.eq([
      {
        code: 401,
        message: "Operação não autorizada"
      }
    ]);
  });

  it("Tried to create a new user with an already existing email and failed", async function () {
    const hashedPassword = await hashPassword("123abc");

    const userDB = await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: hashedPassword,
        birthDate: "01-01-2000"
      }
    });

    const token = generateToken(userDB.id, false);

    const response = await serverRequest({
      url,
      name: "User Mutation Test",
      email: "test@example.com",
      password: "123abc",
      birthDate: "01-01-2000",
      token
    });

    expect(response.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Email já está sendo utilizado, por favor, escolha outro"
      }
    ]);
  });

  it("Tried to create a new user with a password less than 6 digits and failed", async function () {
    const token = generateToken(1, false);

    const response = await serverRequest({
      url,
      name: "User Test",
      email: "test1@example.com",
      password: "123",
      birthDate: "01-01-2000",
      token
    });

    expect(response.errors).to.be.deep.eq([
      {
        code: 400,
        message: "A senha deve conter pelo menos 6 caracteres"
      }
    ]);
  });

  it("Tried to create a new user with a password containing only letters and failed", async function () {
    const token = generateToken(1, false);

    const response = await serverRequest({
      url,
      name: "User Test",
      email: "test1@example.com",
      password: "abcdef",
      birthDate: "01-01-2000",
      token
    });

    expect(response.errors).to.be.deep.eq([
      {
        code: 400,
        message: "A senha deve conter pelo menos uma letra e um número"
      }
    ]);
  });

  it("Tried to create a new user with a password containing only numbers and failed", async function () {
    const token = generateToken(1, false);

    const createdUserResponse = await axios.post(
      url,
      {
        query: createUserMutation,
        variables: {
          data: {
            name: "User Test",
            email: "test1@example.com",
            password: "123456",
            birthDate: "01-01-2000"
          }
        }
      },
      {
        headers: {
          Authorization: token
        }
      }
    );

    expect(createdUserResponse.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "A senha deve conter pelo menos uma letra e um número"
      }
    ]);
  });

  it("Tried to create a new user with a wrongly formatted birthdate and failed", async function () {
    const token = generateToken(1, false);

    const response = await serverRequest({
      url,
      name: "User Test",
      email: "test1@example.com",
      password: "123abc",
      birthDate: "01012000",
      token
    });

    expect(response.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Data inválida, por favor, informe uma data no formato dd-mm-yyyy"
      }
    ]);
  });

  it("Tried to create a new user with a invalid birthdate and failed", async function () {
    const token = generateToken(1, false);

    const response = await serverRequest({
      url,
      name: "User Test",
      email: "test1@example.com",
      password: "123abc",
      birthDate: "01-13-2000",
      token
    });

    expect(response.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Data inválida, por favor, informe uma data no formato dd-mm-yyyy"
      }
    ]);
  });

  it("Tried to create a new user with a invalid birthdate year and failed", async function () {
    const token = generateToken(1, false);

    const response = await serverRequest({
      url,
      name: "User Test",
      email: "test1@example.com",
      password: "123abc",
      birthDate: "01-12-1889",
      token
    });

    const now = new Date();
    const currentYear = now.getFullYear();

    expect(response.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Ano inválido. Ano deve estar entre 1900 e " + currentYear
      }
    ]);
  });
});
