import { useEffect, useState } from "react";
import { usePrivy, useLoginWithEmail, useWallets } from "@privy-io/react-auth";
import { aptos } from "../services/blockchain.services";

const ConnectWalletButton = () => {
  const { ready, authenticated, logout } = usePrivy();
  const { sendCode, loginWithCode } = useLoginWithEmail();
  const { wallets } = useWallets();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code" | "connected">("email");
  const [balance, setBalance] = useState("-");

  const aptosWallet = wallets.find((w) => (w as any).chainType === "aptos");

  const address = aptosWallet?.address;

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

  // ---------- UI STATES ----------
  if (!ready) return null;

  if (!authenticated) {
    return (
      <div className="flex flex-col gap-2 w-72">
        {step === "email" && (
          <>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 rounded-xl border"
            />
            <button
              onClick={async () => {
                await sendCode({ email });
                setStep("code");
              }}
              className="px-4 py-2 rounded-xl bg-[#28334e] text-white font-semibold"
            >
              Continue with Email
            </button>
          </>
        )}

        {step === "code" && (
          <>
            <input
              type="text"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="px-4 py-2 rounded-xl border"
            />
            <button
              onClick={async () => {
                await loginWithCode({ code });
                setStep("connected");
              }}
              className="px-4 py-2 rounded-xl bg-[#28334e] text-white font-semibold"
            >
              Verify Code
            </button>
          </>
        )}
      </div>
    );
  }

  // ---------- CONNECTED ----------
  return (
    <button
      onClick={logout}
      className="px-5 py-2 rounded-2xl bg-[#28334e] text-white font-semibold shadow-lg hover:scale-105 transition"
    >
      <div className="flex flex-col text-left">
        <span>{shortenAddress(address)}</span>
        <span className="text-xs text-gray-300">{balance} MOVE</span>
      </div>
    </button>
  );
};

export default ConnectWalletButton;
