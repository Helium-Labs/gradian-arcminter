import { PinataIPFSClient } from "./PinataIPFSClient";
import { describe, expect, beforeEach, it } from "@jest/globals";
require("dotenv").config();

describe("PinataIPFSClient can pin", () => {
  let client: PinataIPFSClient;
  beforeEach(() => {
    const apiKey: string = process.env.PINATA_JWT!;
    client = new PinataIPFSClient(apiKey);
  });

  it("should upload a file to IPFS", async () => {
    const cid = await client.pinJSONToIPFS({ test: "test" }, { pinataMetadata: { name: "test" } });
    expect(cid).toBeDefined();
  }, 10000);
});
