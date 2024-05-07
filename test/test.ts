import axios from "axios";
import server from "../src/index"; // Import the server setup
import { describe, before, it, after } from "mocha"; // Mocha imports
import assert from "assert";

describe("GraphQL Server Test", function () {
  let serverUrl: string;

  before(async function () {
    serverUrl = "http://localhost:4000";
  });

  it("should return 'Hello world!' from the hello query", async function () {
    const response = await axios.post(serverUrl, {
      query: "{ hello }"
    });

    assert.equal(response.data.data.hello, "Hello world!");
  });

  after(async function () {
    await server.stop();
  });
});
