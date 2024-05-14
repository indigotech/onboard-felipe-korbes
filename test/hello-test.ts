import { url } from "../src/setup-server";
import { assert } from "chai";
import axios from "axios";

describe("Hello Query Test", function () {
  it("Returned 'Hello world!' from the hello query", async function () {
    const response = await axios.post(url, {
      query: "{ hello }"
    });

    assert.equal(response.data.data.hello, "Hello world!");
  });
});
