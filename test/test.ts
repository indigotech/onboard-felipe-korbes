import { describe, before, after } from "mocha"; // Mocha imports
import { setup } from "../src/setup";
import { server } from "../src/setup-server";
import { prisma } from "../src/setup-db";

describe("Hello Query Test", function () {
  before(async function () {
    console.log("Starting setup");
    await setup();
    console.log("Setup complete");
  });

  require("../test/hello-test");
  require("../test/new-user-creation-test");
  require("../test/login-user-test");

  after(async function () {
    await prisma.user.deleteMany({});
    await server.stop();
  });
});
