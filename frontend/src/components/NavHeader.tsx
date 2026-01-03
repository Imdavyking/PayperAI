import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ConnectWalletButton from "./ConnectWalletButton";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useX402Payment } from "../hooks/use-x402";
import { toast } from "react-toastify";
import { SERVER_URL } from "../utils/constants";

// const {user, wallet} = await createWallet({chainType: 'cosmos'}); // or 'stellar', 'sui', etc.

const NavHeader = ({}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { payForAccess, isConnected } = useX402Payment();
  const [isLoading, setIsLoading] = useState(false);
  const handleUnlock = async () => {
    console.log("unlock clicked");
    if (!isConnected) return toast.error("Connect wallet first");

    setIsLoading(true);
    const loadingToast = toast.loading("Checking payment...");

    try {
      // 1. Get payment requirements
      const res = await fetch(`${SERVER_URL}/api/premium-content`);
      if (res.status !== 402) {
        toast.success("Content unlocked!");
        return window.open(
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          "_blank"
        );
      }

      const { accepts } = await res.json();
      if (!accepts?.[0]) throw new Error("No payment requirements");

      // 2. Sign payment (opens wallet)
      toast.loading("Sign in wallet...");
      const xPayment = await payForAccess(accepts[0]);

      // 3. Submit payment
      toast.loading("Processing...");
      const paidRes = await fetch(`${SERVER_URL}/api/premium-content`, {
        headers: { "X-PAYMENT": xPayment },
        redirect: "manual",
      });

      if (
        paidRes.status === 302 ||
        paidRes.ok ||
        paidRes.type === "opaqueredirect"
      ) {
        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
        toast.success("Payment successful!");
      } else {
        throw new Error("Payment failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };
  const links = [
    { to: "#how-it-works", label: "How It Works" },
    { to: "#tools", label: "Tools" },
    { to: "#get-started", label: "Get Started" },
  ];

  const renderLinks = (isMobile = false) =>
    links.map(({ to, label }) => (
      <Link
        key={to}
        to={to}
        onClick={isMobile ? () => setMenuOpen(false) : undefined}
        className="text-lg text-gray-700 hover:text-blue-600"
      >
        {label}
      </Link>
    ));

  return (
    <header className="p-6 border-b shadow-sm bg-white flex justify-between items-center mb-6 relative">
      <Link to="/">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600">
          PayperAI
        </h1>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex space-x-6 items-center">
        {renderLinks()} <ConnectWalletButton />
      </nav>

      {/* Mobile Menu Button */}
      <div className="flex items-center md:hidden space-x-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-700"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <button onClick={() => handleUnlock()} className="text-gray-700">
        unlock
      </button>

      {/* Mobile Nav Dropdown */}
      {menuOpen && (
        <nav className="absolute top-full left-0 right-0 bg-white shadow-md flex flex-col space-y-4 p-4 md:hidden z-50">
          {renderLinks(true)}
          <ConnectWalletButton />
        </nav>
      )}
    </header>
  );
};

export default NavHeader;
