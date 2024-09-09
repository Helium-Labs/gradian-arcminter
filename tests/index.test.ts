import algosdk from 'algosdk';
import { getAlgokitTestkit, fundAccount } from "algokit-testkit";
import 'dotenv/config'
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
  console.log("TODO")
}, 120_000)