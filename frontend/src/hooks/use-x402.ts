import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
  generateSigningMessageForTransaction,
} from "@aptos-labs/ts-sdk";
import { buildAptosLikePaymentHeader } from "x402plus";
import { aptos } from "../services/blockchain.services";
import { useSignRawHash } from "@privy-io/react-auth/extended-chains";
import { usePrivy } from "@privy-io/react-auth";
import { MovementAccount } from "../types";
import { toHex } from "../utils/constants";

// Convert wallet's {0: byte, 1: byte, ...} object to Uint8Array
const toBytes = (obj: Record<string, number>) =>
  new Uint8Array(
    Object.keys(obj)
      .map(Number)
      .sort((a, b) => a - b)
      .map((k) => obj[k])
  );

export function useX402Payment() {
  const { account, signTransaction } = useWallet();
  const { signRawHash } = useSignRawHash();
  const { authenticated, user, logout } = usePrivy();

  const payForAccess = async (paymentRequirements: any): Promise<string> => {
    const isPrivyWallet = !!user?.linkedAccounts?.find(
      (acc: any) => acc.chainType === "aptos"
    );
    const movementWallet: MovementAccount | null = isPrivyWallet
      ? (user?.linkedAccounts?.find(
          (acc: any) => acc.chainType === "aptos"
        ) as MovementAccount)
      : null;

    if (isPrivyWallet) {
      if (!movementWallet) throw new Error("privy wallet not connected");
      const tx = await aptos.transaction.build.simple({
        sender: movementWallet.address,
        data: {
          function: "0x1::aptos_account::transfer",
          functionArguments: [
            paymentRequirements.payTo,
            paymentRequirements.maxAmountRequired,
          ],
        },
      });

      const signingMessage = generateSigningMessageForTransaction(tx);

      const { signature: rawSignature } = await signRawHash({
        address: movementWallet!.address,
        chainType: "aptos",
        hash: `0x${toHex(signingMessage)}`,
      });

      // Extract bytes from Privy's hex string signature
      const sigBytes = Uint8Array.from(
        Buffer.from(rawSignature.slice(2), "hex")
      );
      const pubKeyBytes = Uint8Array.from(
        Buffer.from(movementWallet.publicKey.slice(2), "hex")
      );

      const authenticator = new AccountAuthenticatorEd25519(
        new Ed25519PublicKey(pubKeyBytes),
        new Ed25519Signature(sigBytes)
      );

      return buildAptosLikePaymentHeader(paymentRequirements, {
        signatureBcsBase64: Buffer.from(authenticator.bcsToBytes()).toString(
          "base64"
        ),
        transactionBcsBase64: Buffer.from(tx.bcsToBytes()).toString("base64"),
      });
    } else {
      if (!account) throw new Error("Wallet not connected");
      // Build transfer transaction

      const tx = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: "0x1::aptos_account::transfer",
          functionArguments: [
            paymentRequirements.payTo,
            paymentRequirements.maxAmountRequired,
          ],
        },
      });

      const signed = (await signTransaction({
        transactionOrPayload: tx,
      })) as any;

      // await submit;

      // Extract bytes from wallet's nested response and use SDK classes for BCS serialization

      const pubKeyBytes = toBytes(signed.authenticator.public_key.key.data);
      const sigBytes = toBytes(signed.authenticator.signature.data.data);
      const authenticator = new AccountAuthenticatorEd25519(
        new Ed25519PublicKey(pubKeyBytes),
        new Ed25519Signature(sigBytes)
      );

      return buildAptosLikePaymentHeader(paymentRequirements, {
        signatureBcsBase64: Buffer.from(authenticator.bcsToBytes()).toString(
          "base64"
        ),
        transactionBcsBase64: Buffer.from(tx.bcsToBytes()).toString("base64"),
      });
    }
  };

  return { payForAccess, isConnected: !!account };
}
