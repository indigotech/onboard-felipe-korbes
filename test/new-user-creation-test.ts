import { url } from "../src/setup-server";
import { expect } from "chai";
import { prisma } from "../src/setup-db";
import { createUserMutation } from "./helpers/test-queries";
import axios from "axios";

describe("User creation test", function () {
  it("Created a new user", async function () {
    const response = await axios.post(url, {
      query: createUserMutation,
      variables: {
        data: {
          name: "User Test",
          email: "test@example.com",
          password: "123abc",
          birthDate: "01-01-2000"
        }
      }
    });

    const createdUserDB = await prisma.user.findUnique({
      where: {
        email: "test@example.com"
      }
    });

    const expectedUserDB = {
      id: createdUserDB?.id,
      password: createdUserDB?.password,
      name: "User Test",
      email: "test@example.com",
      birthDate: "01-01-2000",
      age: null
    };

    expect(createdUserDB).to.be.deep.eq(expectedUserDB);
    const userResponse = response.data.data.createUser;

    const expectedUserResponse = {
      id: createdUserDB?.id,
      name: "User Test",
      email: "test@example.com",
      birthDate: "01-01-2000"
    };
    expect(userResponse).to.be.deep.eq(expectedUserResponse);
  });

  it("Tried to create a new user with an already existing email and failed", async function () {
    const userDB = await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: "123abc"
      }
    });

    expect(userDB).to.not.be.null;

    const response = await axios.post(url, {
      query: createUserMutation,
      variables: {
        data: {
          name: "User Test",
          email: "test@example.com",
          password: "123abc",
          birthDate: "01-01-2000"
        }
      }
    });

    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Email já está sendo utilizado, por favor, escolha outro"
      }
    ]);
  });

  it("Tried to create a new user with a password less than 6 digits and failed", async function () {
    const response = await axios.post(url, {
      query: createUserMutation,
      variables: {
        data: {
          name: "User Test",
          email: "test@example.com",
          password: "abc",
          birthDate: "01-01-2000"
        }
      }
    });

    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "A senha deve conter pelo menos 6 caracteres"
      }
    ]);
  });

  it("Tried to create a new user with a password containing only letters and failed", async function () {
    const response = await axios.post(url, {
      query: createUserMutation,
      variables: {
        data: {
          name: "User Test",
          email: "test@example.com",
          password: "abcdef",
          birthDate: "01-01-2000"
        }
      }
    });
    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "A senha deve conter pelo menos uma letra e um número"
      }
    ]);
  });

  it("Tried to create a new user with a password containing only numbers and failed", async function () {
    const response = await axios.post(url, {
      query: createUserMutation,
      variables: {
        data: {
          name: "User Test",
          email: "test@example.com",
          password: "123456",
          birthDate: "01-01-2000"
        }
      }
    });
    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "A senha deve conter pelo menos uma letra e um número"
      }
    ]);
  });

  it("Tried to create a new user with a wrongly formatted birthdate and failed", async function () {
    const response = await axios.post(url, {
      query: createUserMutation,
      variables: {
        data: {
          name: "User Test",
          email: "test@example.com",
          password: "123abc",
          birthDate: "01012000"
        }
      }
    });
    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Data inválida, por favor, informe uma data no formato dd-mm-yyyy"
      }
    ]);
  });

  it("Tried to create a new user with a invalid birthdate and failed", async function () {
    const response = await axios.post(url, {
      query: createUserMutation,
      variables: {
        data: {
          name: "User Test",
          email: "test@example.com",
          password: "123abc",
          birthDate: "01-13-2000"
        }
      }
    });
    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Data inválida, por favor, informe uma data no formato dd-mm-yyyy"
      }
    ]);
  });

  it("Tried to create a new user with a invalid birthdate year and failed", async function () {
    const response = await axios.post(url, {
      query: createUserMutation,
      variables: {
        data: {
          name: "User Test",
          email: "test@example.com",
          password: "123abc",
          birthDate: "01-01-1889"
        }
      }
    });

    const now = new Date();
    const currentYear = now.getFullYear();

    expect(response.data.errors).to.be.deep.eq([
      {
        code: 400,
        message: "Ano inválido. Ano deve estar entre 1900 e " + currentYear
      }
    ]);
  });
});
