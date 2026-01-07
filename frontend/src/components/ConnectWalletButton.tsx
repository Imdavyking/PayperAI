import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptos } from "../services/blockchain.services";

const ConnectWalletButton = () => {
  const { connect, disconnect, account, wallets } = useWallet();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [balance, setBalance] = useState<string>("-");

  const shortenAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const fetchBalance = async (address: string) => {
    try {
      type Coin = { coin: { value: string } };

      const resource = await aptos.getAccountResource<Coin>({
        accountAddress: address,
        resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
      });

      // Now you have access to the response type property
      const value = resource.coin.value;

      if (value) {
        setBalance((Number(value) / 1e8).toFixed(4)); // APT has 8 decimals
      } else {
        setBalance("-");
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setBalance("-");
    }
  };

  useEffect(() => {
    if (!account?.address) {
      setBalance("-");
      return;
    }

    let isMounted = true; // prevents state update after unmount
    const interval = setInterval(async () => {
      try {
        fetchBalance(account.address.toString());
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    }, 5000);

    // cleanup on unmount
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [account]);

  const handleMainClick = () => {
    if (account) setIsDisconnectModalOpen(true);
    else setIsConnectModalOpen(true);
  };

  const handleWalletClick = async (walletName: any) => {
    await connect(walletName);
    setIsConnectModalOpen(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDisconnectModalOpen(false);
    setBalance("0");
  };

  return (
    <>
      {/* Main Button */}
      <button
        onClick={handleMainClick}
        className="px-5 py-2 rounded-2xl bg-[#28334e] text-white font-semibold shadow-lg hover:scale-105 transition-transform cursor-pointer"
      >
        {account?.address ? (
          <div className="flex flex-col text-left">
            <span>{shortenAddress(account.address.toString())}</span>
            <span className="text-xs text-gray-300">{balance} MOVE</span>
          </div>
        ) : (
          "Connect Wallet"
        )}
      </button>

      {/* Connect Modal */}
      {isConnectModalOpen && !account && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Select a Wallet
            </h2>
            <div className="flex flex-col space-y-3">
              {wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletClick(wallet.name)}
                  className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium cursor-pointer"
                >
                  {wallet.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsConnectModalOpen(false)}
              className="mt-5 w-full px-4 py-2 rounded-xl bg-red-500 text-white font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Disconnect Modal */}
      {isDisconnectModalOpen && account && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Disconnect Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Disconnect{" "}
              <span className="font-semibold">
                {shortenAddress(account.address.toString())}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDisconnect}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-semibold"
              >
                Disconnect
              </button>
              <button
                onClick={() => setIsDisconnectModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectWalletButton;
