import { describe, before, it, after } from "mocha"; // Mocha imports
import { assert } from "chai";
import { setup } from "../src/setup";
import { server, url } from "../src/setup-server";
import axios from "axios";

describe("Hello Query Test", function () {
  before(async function () {
    console.log("Starting setup");
    await setup();
    console.log("Setup complete");
  });

  it("Returned 'Hello world!' from the hello query", async function () {
    console.log(url);
    const response = await axios.post(url, {
      query: "{ hello }"
    });

    assert.equal(response.data.data.hello, "Hello world!");
  });

  after(async function () {
    await server.stop();
  });
});
