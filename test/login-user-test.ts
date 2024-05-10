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

    const expectedUser = {
      name: "User Test",
      email: "test@example.com",
      birthDate: "01-01-2000"
    };

    expect(response.data.data.login.user).to.be.deep.eq(expectedUser);

    assert.equal(response.data.data.login.token, "tokenTest");

    await prisma.user.deleteMany({});
  });
});
