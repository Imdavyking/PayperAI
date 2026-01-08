// services/coinDeployment.service.ts
import { 
  Aptos, 
  AptosConfig, 
  Network,
  Account,
  InputViewFunctionData 
} from "@aptos-labs/ts-sdk";

export interface DeployCoinParams {
  name: string;
  symbol: string;
  decimals: number;
  iconUri?: string;
  projectUri?: string;
  initialSupply: number;
}

export class CoinDeploymentService {
  private aptos: Aptos;
  private moduleAddress: string;

  constructor(network: Network = Network.TESTNET) {
    const config = new AptosConfig({ network });
    this.aptos = new Aptos(config);
    this.moduleAddress = "0xYOUR_MODULE_ADDRESS"; // Replace with your deployed module address
  }

  /**
   * Deploy a new meme coin using Fungible Asset standard
   */
  async deployMemeCoin(
    account: Account,
    params: DeployCoinParams
  ): Promise<string> {
    const {
      name,
      symbol,
      decimals,
      iconUri = "",
      projectUri = "",
      initialSupply,
    } = params;

    // Convert initial supply to smallest unit (with decimals)
    const initialSupplyWithDecimals = initialSupply * Math.pow(10, decimals);

    const transaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${this.moduleAddress}::meme_coin_factory::create_meme_coin`,
        functionArguments: [
          name,
          symbol,
          decimals,
          iconUri,
          projectUri,
          initialSupplyWithDecimals,
        ],
      },
    });

    const committedTxn = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const executedTransaction = await this.aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });

    return committedTxn.hash;
  }

  /**
   * Get coin metadata
   */
  async getCoinMetadata(coinAddress: string): Promise<any> {
    try {
      const metadata = await this.aptos.view({
        payload: {
          function: "0x1::fungible_asset::metadata",
          functionArguments: [coinAddress],
        },
      });
      return metadata;
    } catch (error) {
      console.error("Error fetching coin metadata:", error);
      return null;
    }
  }
}