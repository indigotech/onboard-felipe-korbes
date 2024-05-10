import { describe, it } from "mocha"; // Mocha imports
import { assert } from "chai";
import { url } from "../src/setup-server";
import axios from "axios";

describe("Hello Query Test", function () {
  it("Returned 'Hello world!' from the hello query", async function () {
    console.log(url);
    const response = await axios.post(url, {
      query: "{ hello }"
    });

    assert.equal(response.data.data.hello, "Hello world!");
  });
});
