import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaPaperPlane,
  FaImage,
  FaEllipsisV,
  FaTrash,
  FaEdit,
  FaBars,
  FaTimes,
  FaUser,
  FaRobot,
  FaSpinner,
} from "react-icons/fa";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "react-toastify";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { v4 as uuidv4 } from "uuid";
import { MEME_FACTORY, SERVER_URL, toHex } from "../../utils/constants";
import { useX402Payment } from "../../hooks/use-x402";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptos } from "../../services/blockchain.services";
import { useSignRawHash } from "@privy-io/react-auth/extended-chains";
import {
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
  generateSigningMessageForTransaction,
} from "@aptos-labs/ts-sdk";
import { MovementAccount } from "../../types";

// Types
type Message = {
  text: string;
  sender: "user" | "bot";
  timestamp?: Date;
  image?: string | null;
};

type ToolCall = {
  name: string;
  args: any;
  id: string;
  type: string;
};

type AiResponseType = {
  content: string;
  tool_calls: ToolCall[];
};

// Mock constants - replace with your actual imports

const ChatInterface = () => {
  const [conversations, setConversations] = useState([
    { id: "1", title: "New Conversation", timestamp: new Date() },
  ]);
  const { account, signAndSubmitTransaction } = useWallet();
  const { user } = usePrivy();
  const [currentConversationId, setCurrentConversationId] = useState("1");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<
    { name: string; description: string; price: number; path: string }[]
  >([]);
  const [model, setModel] = useState<{
    name: string;
    description: string;
    price: number;
    path: string;
  }>({
    name: "gpt-4o-mini",
    description: "",
    price: 0,
    path: "/api/ai-agent",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { payForAccess, isConnected } = useX402Payment();
  const { signRawHash } = useSignRawHash();
  const [pendingAction, setPendingAction] = useState<ToolCall | null>();

  useEffect(() => {
    const getModels = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/ai-models`, {
          headers: {
            "Content-Type": "application/json",
            "X-Session-ID": sessionId,
          },
        });
        const models = await res.json();
        setModels(models.models);
      } catch (error) {
        console.error("Failed to load models:", error);
      }
    };
    getModels();
  }, []);
  // Session management
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("ai_session_id");
    if (stored) return stored;
    const newId = uuidv4();
    localStorage.setItem("ai_session_id", newId);
    return newId;
  });

  const isPrivyWallet = !!user?.linkedAccounts?.find(
    (acc: any) => acc.chainType === "aptos"
  );

  const movementWallet: MovementAccount | null = isPrivyWallet
    ? (user?.linkedAccounts?.find(
        (acc: any) => acc.chainType === "aptos"
      ) as MovementAccount)
    : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history
  useEffect(() => {
    const getHistory = async () => {
      try {
        if (!sessionId) return;
        const res = await fetch(`${SERVER_URL}/api/ai-user`, {
          headers: {
            "Content-Type": "application/json",
            "X-Session-ID": sessionId,
          },
        });
        const data = await res.json();

        const historyMessages: Message[] = data.history
          .map((msg: any) => {
            if (msg.kwargs.content.trim() === "") return null;
            else if (msg.id[2] === "HumanMessage") {
              return {
                text: msg.kwargs.content,
                sender: "user",
                timestamp: new Date(),
              };
            } else if (msg.id[2] === "AIMessage") {
              return {
                text: msg.kwargs.content,
                sender: "bot",
                timestamp: new Date(),
              };
            }
            return null;
          })
          .filter((msg: Message | null): msg is Message => msg !== null);

        setMessages(historyMessages);
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    };
    const setPassword = async () => {
      try {
        if (!sessionId) return;
        const res = await fetch(`${SERVER_URL}/api/password-exists`, {
          headers: {
            "Content-Type": "application/json",
            "X-Session-ID": sessionId,
          },
        });
        const data = await res.json();
        console.log(data);
      } catch (error) {}
    };
    getHistory();
    setPassword();
  }, [sessionId]);

  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  const requestConfirmation = (action: ToolCall): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setPendingAction(action);
    });
  };

  // Tool implementations
  const tools: { [key: string]: any } = {
    QRY_searchMovementDocs: async ({
      query,
      detailed,
      result,
    }: {
      query: string;
      detailed: boolean;
      result: string | undefined;
    }): Promise<string> => {
      if (result && result.trim() !== "") {
        return result;
      }
      return `Search results for query "${query}" (detailed: ${detailed}) not implemented yet.`;
    },
    CMD_sendMove: async ({
      recipientAddress,
      amount,
    }: {
      recipientAddress: string;
      amount: string;
    }): Promise<string> => {
      try {
        if (isPrivyWallet) {
          if (!movementWallet) throw new Error("Privy wallet not connected");
          const rawTxn = await aptos.transaction.build.simple({
            sender: movementWallet.address,
            data: {
              function: "0x1::aptos_account::transfer",
              functionArguments: [recipientAddress, +amount * 10e7],
            },
          });
          console.log("[Privy] Transaction built successfully");

          // Generate signing message
          const message = generateSigningMessageForTransaction(rawTxn);
          console.log("[Privy] Signing message generated");

          // Sign with Privy wallet
          const { signature: rawSignature } = await signRawHash({
            address: movementWallet!.address,
            chainType: "aptos",
            hash: `0x${toHex(message)}`,
          });

          console.log("[Privy] Transaction signed successfully");

          let cleanPublicKey = movementWallet.publicKey.startsWith("0x")
            ? movementWallet.publicKey.slice(2)
            : movementWallet.publicKey;

          // If public key is 66 characters (33 bytes), remove the first byte (00 prefix)
          if (cleanPublicKey.length === 66) {
            cleanPublicKey = cleanPublicKey.slice(2);
          }

          // Create authenticator
          const senderAuthenticator = new AccountAuthenticatorEd25519(
            new Ed25519PublicKey(cleanPublicKey),
            new Ed25519Signature(
              rawSignature.startsWith("0x")
                ? rawSignature.slice(2)
                : rawSignature
            )
          );

          console.log("[Privy] Submitting transaction to blockchain");

          // Submit the signed transaction
          const committedTransaction = await aptos.transaction.submit.simple({
            transaction: rawTxn,
            senderAuthenticator,
          });

          return `Sent ${amount} MOVE to ${recipientAddress}. Transaction hash: ${committedTransaction.hash}`;
        } else {
          if (!account) throw new Error("Wallet not connected");
          const result = await signAndSubmitTransaction({
            sender: account.address,
            data: {
              function: "0x1::aptos_account::transfer",
              functionArguments: [recipientAddress, +amount * 10e7],
            },
          });
          await aptos.waitForTransaction({ transactionHash: result.hash });
          console.log("Transaction result:", result);
          return `Sent ${amount} MOVE to ${recipientAddress}. Transaction hash: ${result.hash}`;
        }
      } catch (error) {
        return `Error sending MOVE: ${(error as Error).message}`;
      }
    },
    CMD_transferFA: async ({
      recipientAddress,
      amount,
      tokenAddress,
    }: {
      recipientAddress: string;
      amount: string;
      tokenAddress: string;
    }): Promise<string> => {
      try {
        if (isPrivyWallet) {
          if (!movementWallet) throw new Error("Privy wallet not connected");
          const rawTxn = await aptos.transaction.build.simple({
            sender: movementWallet.address,
            data: {
              function: "0x1::primary_fungible_store::transfer",
              typeArguments: ["0x1::fungible_asset::Metadata"],
              functionArguments: [
                tokenAddress, // token metadata address
                recipientAddress, // recipient
                +amount * 10e7,
              ],
            },
          });
          console.log("[Privy] Transaction built successfully");

          // Generate signing message
          const message = generateSigningMessageForTransaction(rawTxn);
          console.log("[Privy] Signing message generated");

          // Sign with Privy wallet
          const { signature: rawSignature } = await signRawHash({
            address: movementWallet!.address,
            chainType: "aptos",
            hash: `0x${toHex(message)}`,
          });

          console.log("[Privy] Transaction signed successfully");

          let cleanPublicKey = movementWallet.publicKey.startsWith("0x")
            ? movementWallet.publicKey.slice(2)
            : movementWallet.publicKey;
          // If public key is 66 characters (33 bytes), remove the first byte (00 prefix)
          if (cleanPublicKey.length === 66) {
            cleanPublicKey = cleanPublicKey.slice(2);
          }

          // Create authenticator
          const senderAuthenticator = new AccountAuthenticatorEd25519(
            new Ed25519PublicKey(cleanPublicKey),
            new Ed25519Signature(
              rawSignature.startsWith("0x")
                ? rawSignature.slice(2)
                : rawSignature
            )
          );

          console.log("[Privy] Submitting transaction to blockchain");

          // Submit the signed transaction
          const committedTransaction = await aptos.transaction.submit.simple({
            transaction: rawTxn,
            senderAuthenticator,
          });

          return `Sent ${amount} tokens of ${tokenAddress} to ${recipientAddress}. Transaction hash: ${committedTransaction.hash}`;
        } else {
          if (!account) throw new Error("Wallet not connected");
          const result = await signAndSubmitTransaction({
            sender: account.address,
            data: {
              function: "0x1::primary_fungible_store::transfer",
              typeArguments: ["0x1::fungible_asset::Metadata"],
              functionArguments: [
                tokenAddress, // token metadata address
                recipientAddress, // recipient
                +amount * 10e7,
              ],
            },
          });
          await aptos.waitForTransaction({ transactionHash: result.hash });
          return `Sent ${amount} tokens of ${tokenAddress} to ${recipientAddress}. Transaction hash: ${result.hash}`;
        }
      } catch (error) {
        return `Error sending FA: ${(error as Error).message}`;
      }
    },
    CMD_deployMemeCoin: async ({
      name,
      symbol,
      initialSupply,
    }: {
      name: string;
      symbol: string;
      initialSupply: string;
    }): Promise<string> => {
      try {
        if (isPrivyWallet) {
          if (!movementWallet) throw new Error("Privy wallet not connected");
          const rawTxn = await aptos.transaction.build.simple({
            sender: movementWallet.address,
            data: {
              function: `${MEME_FACTORY}::message::create_meme_coin`,
              functionArguments: [name, symbol, +initialSupply * 10e7],
            },
          });
          console.log("[Privy] Transaction built successfully");

          // Generate signing message
          const message = generateSigningMessageForTransaction(rawTxn);
          console.log("[Privy] Signing message generated");

          // Sign with Privy wallet
          const { signature: rawSignature } = await signRawHash({
            address: movementWallet!.address,
            chainType: "aptos",
            hash: `0x${toHex(message)}`,
          });

          console.log("[Privy] Transaction signed successfully");
          let cleanPublicKey = movementWallet.publicKey.startsWith("0x")
            ? movementWallet.publicKey.slice(2)
            : movementWallet.publicKey;
          // If public key is 66 characters (33 bytes), remove the first byte (00 prefix)
          if (cleanPublicKey.length === 66) {
            cleanPublicKey = cleanPublicKey.slice(2);
          }
          // Create authenticator
          const senderAuthenticator = new AccountAuthenticatorEd25519(
            new Ed25519PublicKey(cleanPublicKey),
            new Ed25519Signature(
              rawSignature.startsWith("0x")
                ? rawSignature.slice(2)
                : rawSignature
            )
          );

          console.log("[Privy] Submitting transaction to blockchain");
          // Submit the signed transaction
          const committedTransaction = await aptos.transaction.submit.simple({
            transaction: rawTxn,
            senderAuthenticator,
          });

          // Fetch transaction details to get the memecoin address
          const response = await aptos.waitForTransaction({
            transactionHash: committedTransaction.hash,
          });
          const metadataChange = response.changes.find((change) => {
            return (
              change.type === "write_resource" &&
              (change as any)?.data?.type === "0x1::fungible_asset::Metadata"
            );
          });
          return `Deployed Memecoin ${name} (${symbol}) with initial supply ${initialSupply}. Address: ${
            (metadataChange as any)?.address
          }. Transaction hash: ${committedTransaction.hash}`;
        } else {
          if (!account) throw new Error("Wallet not connected");
          const result = await signAndSubmitTransaction({
            sender: account.address,
            data: {
              function: `${MEME_FACTORY}::message::create_meme_coin`,
              functionArguments: [name, symbol, +initialSupply * 10e7],
            },
          });
          const response = await aptos.waitForTransaction({
            transactionHash: result.hash,
          });
          const metadataChange = response.changes.find((change) => {
            return (
              change.type === "write_resource" &&
              (change as any)?.data?.type === "0x1::fungible_asset::Metadata"
            );
          });
          return `Deployed Memecoin ${name} (${symbol}) with initial supply ${initialSupply}. Address: ${
            (metadataChange as any)?.address
          }. Transaction hash: ${result.hash}`;
        }
      } catch (error) {
        return `Error deploying Memecoin: ${(error as Error).message}`;
      }
    },
  };

  const executeAction = async (action: ToolCall) => {
    const tool = tools[action.name];
    if (!tool) {
      return `Tool ${action.name} not found`;
    }

    if (action.name.trim().startsWith("CMD_")) {
      const approved = await requestConfirmation(action);
      if (!approved)
        return `❌ Did not approve ❌
    ${action.args.confirmationMessage}`;
    }

    return await tool(action.args ?? {});
  };

  const handleSendWithPayment = async (): Promise<AiResponseType | null> => {
    const input = userInput.trim();
    if (!input && !selectedImage) return null;

    if (!isConnected && !isPrivyWallet) {
      toast.error("Connect wallet first");
      return null;
    }

    const loadingToast = toast.loading("Processing...");

    try {
      const query = input;
      const res = await fetch(`${SERVER_URL}${model.path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": sessionId,
          "X-Model": model.name,
        },
        body: JSON.stringify({ task: query }),
      });

      let responseData;
      if (res.status === 402) {
        const { accepts } = await res.json();
        if (!accepts?.[0]) throw new Error("No payment requirements");

        toast.loading("Sign in wallet...", { toastId: loadingToast });
        const xPayment = await payForAccess(accepts[0]);

        toast.loading("Processing payment...", { toastId: loadingToast });
        const paidRes = await fetch(`${SERVER_URL}${model.path}`, {
          headers: {
            "X-PAYMENT": xPayment,
            "X-Session-ID": sessionId,
            "X-Model": model.name,
            "Content-Type": "application/json",
          },
          redirect: "manual",
          method: "POST",
          body: JSON.stringify({ task: query }),
        });

        if (!paidRes.ok) throw new Error("Payment failed");
        responseData = await paidRes.json();
      } else {
        if (!res.ok) throw new Error("Failed to fetch AI agent");
        responseData = await res.json();
      }

      return responseData;
    } catch (err: any) {
      toast.error(err.message || "Failed to send message", {
        toastId: loadingToast,
      });
      respondToUser([`Error: ${err.message || "Failed to send message"}`]);
      return null;
    } finally {
      setIsProcessing(false);
      toast.dismiss(loadingToast);
    }
  };

  const respondToUser = (response: string[]) => {
    setTimeout(() => {
      response.forEach((res) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: res, sender: "bot", timestamp: new Date() },
        ]);
      });
    }, 500);
  };

  const handleSend = async () => {
    if (userInput.trim() !== "" || selectedImage) {
      // Add user message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: userInput,
          sender: "user",
          timestamp: new Date(),
          image: selectedImage,
        },
      ]);
      setUserInput("");
      setSelectedImage(null);

      try {
        setIsProcessing(true);
        const paidResult = await handleSendWithPayment();
        if (!paidResult) {
          setIsProcessing(false);
          return;
        }

        const results: string[] = [];
        if (paidResult.content.trim() !== "") {
          results.push(paidResult.content);
        }
        const toolsResults: string[] = [];

        for (const toolCall of paidResult.tool_calls) {
          const result = await executeAction(toolCall);
          results.push(result);
          toolsResults.push(result);
        }

        const res = await fetch(`${SERVER_URL}/api/ai-memory-add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-ID": sessionId,
          },
          body: JSON.stringify({ lastToolAIMsg: toolsResults }),
        });
        await res.json();
        respondToUser(results);
      } catch (error: any) {
        toast.error(`${error.message || "Error processing request"}`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleNewChat = () => {
    const newId = uuidv4();
    localStorage.setItem("ai_session_id", newId);
    const newConv = {
      id: newId,
      title: "New Conversation",
      timestamp: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newId);
    setMessages([]);
    window.location.reload(); // Reload to get new session
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
    if (currentConversationId === id && conversations.length > 1) {
      setCurrentConversationId(conversations[0].id);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-0"
        } bg-[#28334e] transition-all duration-300 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={handleNewChat}
            className="w-full bg-white text-[#28334e] py-2.5 px-4 rounded-lg hover:bg-gray-100 transition duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <FaPlus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setCurrentConversationId(conv.id)}
              className={`p-3 mb-2 rounded-lg cursor-pointer group hover:bg-gray-700 transition duration-200 ${
                currentConversationId === conv.id ? "bg-gray-700" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {conv.title}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {conv.timestamp.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-1.5 hover:bg-gray-600 rounded"
                  >
                    <FaEdit className="w-3 h-3 text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                    className="p-1.5 hover:bg-gray-600 rounded"
                  >
                    <FaTrash className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700 relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FaUser className="w-4 h-4 text-white" />
            </div>
            {model && (
              <span className="text-white text-sm ml-2">{model.name}</span>
            )}

            {/* Ellipsis Button */}
            <button
              onClick={() => setOpen(!open)}
              className="p-2 hover:bg-gray-700 rounded"
            >
              <FaEllipsisV className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Dropdown */}
          {open && models && (
            <div className="absolute bottom-16 left-4 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
              {models.map((m) => (
                <button
                  key={m.name}
                  onClick={() => {
                    setModel(m);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${
                    model.name === m.name
                      ? "bg-gray-700 text-white"
                      : "text-gray-300"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              {isSidebarOpen ? (
                <FaTimes className="w-5 h-5 text-gray-600" />
              ) : (
                <FaBars className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <h1 className="text-xl font-semibold text-[#28334e]">AI Agent</h1>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <FaRobot className="w-16 h-16 mx-auto mb-4 text-[#28334e]" />
                <h2 className="text-2xl font-semibold mb-2">
                  Welcome to AI Agent
                </h2>
                <p>How can I help you today?</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === "user" ? "bg-blue-500" : "bg-[#28334e]"
                  }`}
                >
                  {message.sender === "user" ? (
                    <FaUser className="w-4 h-4 text-white" />
                  ) : (
                    <FaRobot className="w-4 h-4 text-white" />
                  )}
                </div>

                <div
                  className={`flex-1 ${
                    message.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap break-words overflow-hidden ${
                      message.sender === "user"
                        ? "bg-[#28334e] text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                    }`}
                    style={{ overflowWrap: "anywhere" }} // bulletproof wrapping
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Uploaded"
                        className="max-w-full rounded-lg mb-2"
                      />
                    )}

                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      className="prose prose-sm max-w-none whitespace-pre-wrap break-words"
                      components={{
                        code({ inline, children }) {
                          return inline ? (
                            <code className="px-1 py-0.5 rounded bg-gray-200 text-gray-900 break-all">
                              {children}
                            </code>
                          ) : (
                            <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-gray-900 p-3 text-white">
                              <code>{children}</code>
                            </pre>
                          );
                        },
                      }}
                    >
                      {message.text}
                    </Markdown>
                  </div>

                  {message.timestamp && (
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#28334e] flex items-center justify-center flex-shrink-0">
                  <FaRobot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="inline-block bg-white border border-gray-200 p-4 rounded-2xl">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="max-w-3xl mx-auto">
            {selectedImage && (
              <div className="mb-3 relative inline-block">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="max-h-32 rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2 bg-gray-100 rounded-2xl p-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 hover:bg-gray-200 rounded-xl transition duration-200 flex-shrink-0"
                title="Upload image"
              >
                <FaImage className="w-5 h-5 text-gray-600" />
              </button>

              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message AI Agent..."
                className="flex-1 bg-transparent px-2 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none resize-none max-h-32"
                rows={1}
                disabled={isProcessing}
              />

              <button
                onClick={handleSend}
                disabled={(!userInput.trim() && !selectedImage) || isProcessing}
                className={`p-2.5 rounded-xl transition duration-200 flex-shrink-0 ${
                  (userInput.trim() || selectedImage) && !isProcessing
                    ? "bg-[#28334e] hover:bg-[#1f2937] text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isProcessing ? (
                  <FaSpinner className="w-5 h-5 animate-spin" />
                ) : (
                  <FaPaperPlane className="w-5 h-5" />
                )}
              </button>
            </div>

            {pendingAction && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
                <div
                  className="bg-gray-900 border border-gray-700 rounded-xl p-5
                    max-w-lg w-fit"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Confirm Action
                  </h3>

                  <p className="text-sm text-gray-300 mb-4 whitespace-normal break-words">
                    {pendingAction.args?.confirmationMessage ||
                      `Do you want to execute "${pendingAction.name}"?`}
                  </p>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        confirmResolverRef.current?.(false);
                        confirmResolverRef.current = null;
                        setPendingAction(null);
                      }}
                      className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => {
                        confirmResolverRef.current?.(true);
                        confirmResolverRef.current = null;
                        setPendingAction(null);
                      }}
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center mt-2">
              AI Agent can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
