import {
  IPFSPinningService,
} from "./types";
import axios from "axios";
import FormData from "form-data";
import fs from 'fs'
import { File } from "buffer";


export const PINATA_JSON_PIN_URL =
  "https://api.pinata.cloud/pinning/pinJSONToIPFS";
export const PINATA_FILE_PIN_URL =
  "https://api.pinata.cloud/pinning/pinFileToIPFS";

export interface PinataMetadata {
  [key: string]: string | number | null;
}

export interface PinataPinPolicyItem {
  id: string;
  desiredReplicationCount: number;
}

export interface PinataOptions {
  hostNodes?: string[] | undefined;
  cidVersion?: 0 | 1;
  wrapWithDirectory?: boolean;
  customPinPolicy?: {
    regions: PinataPinPolicyItem[];
  };
}

export interface PinataPinResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface PinataPinOptions {
  pinataMetadata?: PinataMetadata;
  pinataOptions?: PinataOptions | undefined;
}

async function uploadJSON(
  obj: any,
  options: PinataPinOptions,
  jwt: string
): Promise<PinataPinResponse> {
  const data = JSON.stringify({
    pinataOptions: options.pinataOptions,
    pinataMetadata: options.pinataMetadata,
    pinataContent: obj,
  });

  const config = {
    method: "post",
    url: PINATA_JSON_PIN_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    data,
  };

  const res = await axios(config);
  return res.data as any as PinataPinResponse;
}

async function uploadFile(
  file: File,
  options: PinataPinOptions,
  jwt: string
): Promise<PinataPinResponse> {
  const formData = new FormData();
  const fileBuf = await file.arrayBuffer()
  const fileStream = fs.ReadStream.from(Buffer.from(fileBuf))
  formData.append("file", fileStream, { filename: 'file' });

  const pinataMetadata = JSON.stringify(options.pinataMetadata);
  formData.append("pinataMetadata", pinataMetadata);
  const pinataOptions = JSON.stringify(options.pinataOptions ?? {});
  formData.append("pinataOptions", pinataOptions);

  const res = await axios.post(PINATA_FILE_PIN_URL, formData, {
    maxBodyLength: Infinity,
    headers: {
      // @ts-ignore
      "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
      Authorization: `Bearer ${jwt}`,
    },
  });

  return res.data;
}

export class PinataIPFSClient implements IPFSPinningService<PinataPinOptions> {
  JWT: string;
  constructor(JWT: string) {
    this.JWT = JWT;
  }

  /**
   * Receive the file from the client, and upload it to IPFS. Return the hash of the file, and its IPFS URL.
   * @param {ReadableStream} nftFile
   * @param {PinataPinOptions | undefined} options
   * @returns {Promise<string>} IPFS Hash Content Identifier (CID)
   */
  async pinFileToIPFS(file: File, options?: PinataPinOptions): Promise<string> {
    if (!options) {
      throw new Error("Pinata options are required");
    }
    const ipfs = await uploadFile(file, options, this.JWT);
    return ipfs.IpfsHash;
  }

  /**
   * Pin JSON metadata to IPFS
   * @param {any} json
   * @param {PinataPinOptions | undefined} options
   * @returns {Promise<string>} IPFS Hash Content Identifier (CID)
   */
  async pinJSONToIPFS(json: any, options: PinataPinOptions): Promise<string> {
    const result = await uploadJSON(json, options, this.JWT);
    return result.IpfsHash;
  }
}
