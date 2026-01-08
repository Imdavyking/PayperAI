import { useEffect, useState } from "react";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { useCreateWallet } from "@privy-io/react-auth/extended-chains";
import { aptos } from "../services/blockchain.services";

const ConnectWalletButton = () => {
  const { ready, authenticated, user, logout } = usePrivy();
  const { createWallet } = useCreateWallet();
  const [balance, setBalance] = useState("-");
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Get Movement/Aptos wallet from user's linked accounts
  const movementWallet = user?.linkedAccounts?.find(
    (account: any) => account.chainType === "aptos"
  ) as any;

  const address = movementWallet?.address;

  const shortenAddress = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const fetchBalance = async (addr: string) => {
    try {
      type Coin = { coin: { value: string } };

      const resource = await aptos.getAccountResource<Coin>({
        accountAddress: addr,
        resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
      });

      setBalance((Number(resource.coin.value) / 1e8).toFixed(4));
    } catch {
      setBalance("-");
    }
  };

  useEffect(() => {
    if (!address) return;

    fetchBalance(address);
    const interval = setInterval(() => fetchBalance(address), 5000);

    return () => clearInterval(interval);
  }, [address]);

  // Handle wallet creation after login
  const handleWalletCreation = async (user: any) => {
    try {
      setIsCreatingWallet(true);

      // Check if user already has an Aptos/Movement wallet
      const existingWallet = user?.linkedAccounts?.find(
        (account: any) => account.chainType === "aptos"
      );

      if (existingWallet) {
        console.log("Movement wallet already exists:", existingWallet.address);
        setShowModal(false);
        return;
      }

      // Create a new Aptos/Movement wallet
      console.log("Creating new Movement wallet...");
      const wallet = await createWallet({ chainType: "aptos" });
      console.log("Movement wallet created:", (wallet as any)?.address);
      setShowModal(false);
    } catch (error) {
      console.error("Wallet creation error:", error);
    } finally {
      setIsCreatingWallet(false);
    }
  };

  // Setup login with auto wallet creation
  const { login } = useLogin({
    onComplete: async ({ user }) => {
      try {
        await handleWalletCreation(user);
      } catch (error) {
        console.error("Error in login completion:", error);
        setIsCreatingWallet(false);
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
      setIsCreatingWallet(false);
    },
  });

  const handleConnect = async () => {
    try {
      setIsCreatingWallet(true);

      if (!authenticated) {
        // Login with Privy
        await login();
      } else {
        // User is already authenticated, just create wallet
        await handleWalletCreation(user);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setIsCreatingWallet(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
      setBalance("-");
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  // Loading state
  if (!ready) {
    return (
      <button
        disabled
        className="px-5 py-2 rounded-2xl bg-gray-400 text-white font-semibold shadow-lg cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  // Not authenticated - show connect button
  if (!authenticated) {
    return (
      <button
        onClick={handleConnect}
        disabled={isCreatingWallet}
        className="px-5 py-2 rounded-2xl bg-[#28334e] text-white font-semibold shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCreatingWallet ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  // Authenticated but no wallet yet
  if (!movementWallet) {
    return (
      <button
        onClick={() => handleWalletCreation(user)}
        disabled={isCreatingWallet}
        className="px-5 py-2 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
      >
        {isCreatingWallet ? "Creating Wallet..." : "Setup Movement Wallet"}
      </button>
    );
  }

  // Connected with wallet - show address and balance
  return (
    <div className="relative">
      <button
        onClick={() => setShowModal(!showModal)}
        className="px-5 py-2 rounded-2xl bg-[#28334e] text-white font-semibold shadow-lg hover:scale-105 transition-transform"
      >
        <div className="flex flex-col text-left">
          <span>{shortenAddress(address)}</span>
          <span className="text-xs text-gray-300">{balance} MOVE</span>
        </div>
      </button>

      {/* Dropdown menu */}
      {showModal && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Connected Address</p>
              <p className="text-sm font-mono break-all">{address}</p>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Balance</p>
              <p className="text-lg font-semibold">{balance} MOVE</p>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Logged in as</p>
              <p className="text-sm">
                {user?.email?.address || user?.phone?.number || "User"}
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(address || "");
                alert("Address copied!");
              }}
              className="w-full mb-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Copy Address
            </button>

            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showModal && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ConnectWalletButton;
