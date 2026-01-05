import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ConnectWalletButton from "./ConnectWalletButton";
import { useX402Payment } from "../hooks/use-x402";
import { toast } from "react-toastify";
import { SERVER_URL } from "../utils/constants";

const NavHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { payForAccess, isConnected } = useX402Payment();
  const [isLoading, setIsLoading] = useState(false);
  const handleUnlock = async () => {
    console.log("unlock clicked");
    if (!isConnected) return toast.error("Connect wallet first");

    setIsLoading(true);
    const loadingToast = toast.loading("Checking payment...");

    try {
      const query = "Explain quantum computing in simple terms";
      const res = await fetch(`${SERVER_URL}/api/ai-agent`, {
        method: "POST",
        body: JSON.stringify({
          task: query,
        }),
      });
      if (res.status !== 402) {
        if (!res.ok) {
          throw new Error("Failed to fetch contract audit");
        }
        return await res.json();
      }

      const { accepts } = await res.json();
      if (!accepts?.[0]) throw new Error("No payment requirements");

      // 2. Sign payment (opens wallet)
      toast.loading("Sign in wallet...", {
        toastId: loadingToast,
      });
      const xPayment = await payForAccess(accepts[0]);

      // 3. Submit payment
      toast.loading("Processing...", {
        toastId: loadingToast,
      });
      const paidRes = await fetch(`${SERVER_URL}/api/ai-agent`, {
        headers: { "X-PAYMENT": xPayment },
        redirect: "manual",
        method: "POST",
        body: JSON.stringify({
          task: query,
        }),
      });

      if (
        paidRes.status === 302 ||
        paidRes.ok ||
        paidRes.type === "opaqueredirect"
      ) {
        if (!paidRes.ok) {
          throw new Error("Failed to fetch contract audit");
        }
        return await paidRes.json();
      } else {
        throw new Error("Payment failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Payment failed", {
        toastId: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const links = [
    { to: "#how-it-works", label: "How It Works" },
    { to: "#tools", label: "Tools" },
    { to: "#get-started", label: "Get Started" },
  ];

  const renderLinks = (isMobile = false) => {
    return links.map(({ to, label }) => (
      <Link
        key={to}
        to={to}
        onClick={isMobile ? () => setMenuOpen(false) : undefined}
        className="text-lg text-gray-700 hover:text-blue-600"
      >
        {label}
      </Link>
    ));
  };

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

      <button
        onClick={async () => {
          const res = await handleUnlock();
          console.log("AI Agent Response:", res);
        }}
        className="text-gray-700"
      >
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
