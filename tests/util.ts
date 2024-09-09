import { type TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account'
import { type Transaction } from 'algosdk'
import algosdk from 'algosdk'
import { AssertDefined } from '../src/util'

export function getTransactionSignerFromMnemonic(
    mnemonic: string
): TransactionSignerAccount {
    const account = algosdk.mnemonicToSecretKey(mnemonic)
    return {
        addr: account.addr,
        signer: async (txnGroup: Transaction[], indexesToSign: number[]) => {
            const signedTxs: Uint8Array[] = []
            for (const indexToSign of indexesToSign) {
                const txToSign = txnGroup[indexToSign]
                AssertDefined(txToSign, 'txToSign must be defined')
                const signedTx = algosdk.signTransaction(txToSign, account.sk)
                signedTxs.push(signedTx.blob)
            }
            return signedTxs
        }
    }
}