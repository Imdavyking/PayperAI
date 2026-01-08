import { PropsWithChildren } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { defineChain } from "viem";
export const movementTestnet = defineChain({
  id: 250,
  name: "Movement Testnet",
  network: "movement-testnet",
  nativeCurrency: {
    decimals: 8,
    name: "MOVE",
    symbol: "MOVE",
  },
  rpcUrls: {
    default: {
      http: [
        import.meta.env.VITE_MOVEMENT_TESTNET_RPC_URL ||
          "https://testnet.movementnetwork.xyz/v1",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Movement Explorer",
      url: "https://explorer.movementnetwork.xyz/?network=bardock+testnet",
    },
  },
  testnet: true,
});

export function PrivyProviderWrapper({ children }: PropsWithChildren) {
  const appId = import.meta.env.VITE_PRIVY_APP_ID;
  const clientId = import.meta.env.VITE_PRIVY_CLIENT_ID;

  if (!appId || !clientId) {
    throw new Error(
      "Missing Privy configuration. Please set VITE_PRIVY_APP_ID and VITE_PRIVY_CLIENT_ID in your environment variables."
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId}
      config={{
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        defaultChain: movementTestnet,
        supportedChains: [movementTestnet],
        appearance: {
          theme: "dark",
          accentColor: "#FFF",
          logo: "",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
