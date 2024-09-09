import algosdk from 'algosdk';
import { getAlgokitTestkit, fundAccount } from "algokit-testkit";
import 'dotenv/config'
import { NFTAssetMinter, IPFSClients, Arc3Arc19Metadata, CreateAssetTransactionConfig } from '../src'
import { KeyPairSigner } from '@gradian/util';
import { File } from "buffer";
import path from "path";
import fs from 'fs';
import { generateRandomString } from '../src/util';

const TEST_MNEMONIC = process.env["ALGORAND_TEST_MNEMONIC"] || "";

const networks = ["Mainnet", "Testnet", "Devnet"];
type Network = (typeof networks)[number];
const env: Network = "Testnet" as Network

const getAlgod = async () => {
  if (env === 'Testnet') {  // Type-safe comparison
    // Define the Algorand node connection parameters
    const algodToken = '' // free service does not require tokens
    const algodServer = 'https://testnet-api.algonode.cloud'
    const algodPort = 443

    // Create an instance of the algod client
    return new algosdk.Algodv2(algodToken, algodServer, algodPort)
  } else {
    const { algod } = await getAlgokitTestkit()
    return algod
  }
}

test("TODO", async () => {
  // minterCreateArc19Asset
  const algod = await getAlgod()
  const account = algosdk.mnemonicToSecretKey(TEST_MNEMONIC)
  const signer = new KeyPairSigner(algod, account)
  fundAccount(signer.getWalletAddress()!, 1e6)
  const apiKey: string = process.env.PINATA_JWT!;
  let client: IPFSClients.Pinata.PinataIPFSClient = new IPFSClients.Pinata.PinataIPFSClient(apiKey);

  const minter = new NFTAssetMinter(algod, client, signer)
  const name = generateRandomString(32)
  const options: Arc3Arc19Metadata = {
    description: "test",
    name: name,
    external_url: 'https://test.com',
    properties: { test: 123 },
    network: 'testnet'
  }
  const createAssetConfig: CreateAssetTransactionConfig = {
    assetName: "test",
    unitName: "test",
    total: 1000,
    decimals: 0,
    defaultFrozen: false,
    manager: signer.getWalletAddress()!,
    freeze: signer.getWalletAddress()!,
    clawback: signer.getWalletAddress()!,
    reserve: signer.getWalletAddress()!
  }

  const pinataOptions: IPFSClients.Pinata.PinataPinOptions = {
    pinataOptions: {
      cidVersion: 1,
    },
    pinataMetadata: {
      name
    },
  };

  const jpegImage = fs.readFileSync(path.resolve(__dirname, './test.jpg'));
  const file = new File([jpegImage], 'test.jpg', { type: 'image/jpeg' });

  const mintedAssetId = await minter.minterCreateArc19Asset({
    createAssetConfig,
    options,
    pinningOptions: pinataOptions,
    file: file
  })
  console.log('mintedAssetId:', mintedAssetId)
  expect(mintedAssetId).toBeDefined()
}, 120_000)