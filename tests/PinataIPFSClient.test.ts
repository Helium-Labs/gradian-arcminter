import { generateRandomString } from "../src/util";
import { PinataIPFSClient } from "../src/IPFSClients/PinataIPFSClient";
import { describe, expect, beforeEach, it } from "@jest/globals";
import fs from 'fs'
import path from "path";
import { File } from "buffer";

require("dotenv").config();

describe("PinataIPFSClient can pin", () => {
  let client: PinataIPFSClient;
  beforeEach(() => {
    const apiKey: string = process.env.PINATA_JWT!;
    client = new PinataIPFSClient(apiKey);
  });

  it("can pin JSON", async () => {
    const name = generateRandomString(32)
    const cid = await client.pinJSONToIPFS({ test: name }, { pinataMetadata: { name: name } });
    expect(cid).toBeDefined();
  }, 10000);

  it("can pin file", async () => {
    const name = generateRandomString(32)
    const jpegImage = fs.readFileSync(path.resolve(__dirname, './test.jpg'));
    const file = new File([jpegImage], 'test.jpg', { type: 'image/jpeg' });
    const cid = await client.pinFileToIPFS(file, { pinataMetadata: { name: name } });
    expect(cid).toBeDefined();
  }, 10000);
});
