import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { tokens } from "../utils/constants";
import { AccountInfo } from "@aptos-labs/wallet-adapter-core";

const config = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: "https://testnet.movementnetwork.xyz/v1",
  faucet: "https://faucet.testnet.movementnetwork.xyz/",
});
export const aptos = new Aptos(config);
export const getUserBalance = async (
  account: AccountInfo,
  token: string
): Promise<number> => {
  if (token == tokens[0].address) {
    try {
      const balance = await aptos.getBalance({
        accountAddress: account.address,
        asset: "0x1::aptos_coin::AptosCoin",
      });
      return balance / 10 ** 8;
    } catch (error) {
      return 0;
    }
  }

  return 0;
};
