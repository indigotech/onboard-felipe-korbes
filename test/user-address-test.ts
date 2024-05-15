import { url } from "../src/setup-server";
import { expect } from "chai";
import { userSeed } from "../src/user-seed";
import { generateToken } from "../src/graphql/helpers/login-handlers";
import { defaultSearchValue } from "../src/graphql/resolvers";
import { prisma } from "../src/setup-db";

describe("Address Tests", function () {
  it("Added two addresses to one user", async function () {
    const userDB = await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: "123abc",
        birthDate: "01-01-2000",
        address: {
          create: [
            {
              zipCode: 12345678,
              street: "Street 1",
              streetNumber: 1,
              city: "City 1",
              state: "State 1"
            },
            {
              zipCode: 12345678,
              street: "Street 2",
              streetNumber: 2,
              city: "City 2",
              state: "State 2"
            }
          ]
        }
      }
    });

    const address = await prisma.address.findMany({
      where: {
        userID: userDB.id
      }
    });

    expect(address.length).to.equal(2);

    const expectedAddress1 = {
      id: address[0].id,
      zipCode: 12345678,
      street: "Street 1",
      complement: null,
      neighborhood: null,
      streetNumber: 1,
      city: "City 1",
      state: "State 1",
      userID: userDB.id
    };

    const expectedAddress2 = {
      id: address[1].id,
      zipCode: 12345678,
      street: "Street 2",
      complement: null,
      neighborhood: null,
      streetNumber: 2,
      city: "City 2",
      state: "State 2",
      userID: userDB.id
    };

    expect(address[0]).to.be.deep.eq(expectedAddress1);
    expect(address[1]).to.be.deep.eq(expectedAddress2);
    await prisma.address.deleteMany({});
  });
});
