import { setup } from "../src/setup";
import { server } from "../src/setup-server";
import { prisma } from "../src/setup-db";
import { describe, before, after } from "mocha";

describe("General Tests", function () {
  before(async function () {
    console.log("Starting setup");
    await setup();
    console.log("Setup complete");
  });

  afterEach(async function () {
    await prisma.user.deleteMany({});
  });

  require("./hello-test");
  require("./new-user-creation-test");
  require("./login-user-test");

  after(async function () {
    await server.stop();
  });
});
