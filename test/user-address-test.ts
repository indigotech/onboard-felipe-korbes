import { expect } from "chai";
import { prisma } from "../src/setup-db";

describe("Address Tests", function () {
  afterEach(async function () {
    await prisma.address.deleteMany({});
  });

  it("Added two addresses to one user", async function () {
    const userDB = await prisma.user.create({
      data: {
        name: "User Test",
        email: "test@example.com",
        password: "123abc",
        birthDate: "01-01-2000",
        addresses: {
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

    const addresses = await prisma.address.findMany({
      where: {
        userID: userDB.id
      }
    });

    const expectedAddress1 = {
      id: addresses[0].id,
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
      id: addresses[1].id,
      zipCode: 12345678,
      street: "Street 2",
      complement: null,
      neighborhood: null,
      streetNumber: 2,
      city: "City 2",
      state: "State 2",
      userID: userDB.id
    };

    expect(addresses).to.be.deep.eq([expectedAddress1, expectedAddress2]);
  });
});

