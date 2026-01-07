import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ===== Header ===== */}

      {/* ===== Hero Section ===== */}
      <section className="flex-1 bg-gradient-to-r bg-[#28334e] text-white flex flex-col justify-center items-center text-center px-6 py-24">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
          AI Agent + Blockchain Pay-per-Use
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">
          Build, explore, and run AI-powered tools securely on-chain. Pay per
          request with x402 blockchain transactions.
        </p>
        <a
          href="#get-started"
          className="bg-white text-[#28334e] font-bold py-3 px-8 rounded-lg shadow hover:bg-gray-100 transition"
        >
          Get Started
        </a>
      </section>

      {/* ===== How It Works ===== */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-gray-800 text-center mb-12">
          How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl mb-4">💳</div>
            <h4 className="text-xl font-semibold mb-2">Pay On-Chain</h4>
            <p className="text-gray-600">
              Users pay per request via blockchain (x402 transaction) before
              running any AI function.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h4 className="text-xl font-semibold mb-2">AI Agent Executes</h4>
            <p className="text-gray-600">
              Once payment is verified, the AI agent processes the request
              securely and returns results.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl mb-4">📈</div>
            <h4 className="text-xl font-semibold mb-2">Get Results</h4>
            <p className="text-gray-600">
              Receive real-time results from AI-powered tools while ensuring
              on-chain payment security.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Tools Section ===== */}
      <section id="tools" className="bg-gray-100 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800">Available Tools</h3>
          <p className="text-gray-600 mt-2">
            Explore the AI functions you can run on-chain with PayPerAI.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h4 className="text-xl font-semibold mb-2">Web Search AI</h4>
            <p className="text-gray-600 mb-4">
              Search the web for AI news or topics instantly.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h4 className="text-xl font-semibold mb-2">Deploy Memecoin</h4>
            <p className="text-gray-600 mb-4">
              Deploy a MemeCoin with a name, symbol, and initial supply.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h4 className="text-xl font-semibold mb-2">Send MOVE</h4>
            <p className="text-gray-600 mb-4">
              Send MOVE tokens to any address securely via AI command.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Call To Action ===== */}
      <section id="get-started" className="py-16 px-6 text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-4">
          Ready to start?
        </h3>
        <p className="text-gray-600 mb-8">
          Pay per request with blockchain and run AI tools instantly.
        </p>
        <Link
          to="/chatbot"
          className="bg-[#28334e] text-white font-bold py-3 px-8 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Launch Agent
        </Link>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-white shadow-inner py-6 text-center text-gray-600">
        © {new Date().getFullYear()} PayPerAI. Built with AI + Blockchain.
      </footer>
    </div>
  );
};

export default HomePage;
