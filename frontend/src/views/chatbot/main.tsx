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

import { toast } from "react-toastify";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { v4 as uuidv4 } from "uuid";
import { SERVER_URL } from "../../utils/constants";
import { useX402Payment } from "../../hooks/use-x402";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptos } from "../../services/blockchain.services";

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
  const [currentConversationId, setCurrentConversationId] = useState("1");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { payForAccess, isConnected } = useX402Payment();
  const { account, signAndSubmitTransaction } = useWallet();
  // Session management
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("ai_session_id");
    if (stored) return stored;
    const newId = uuidv4();
    localStorage.setItem("ai_session_id", newId);
    return newId;
  });

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
        const res = await fetch(`${SERVER_URL}/api/ai-user`, {
          headers: {
            "Content-Type": "application/json",
            "X-Session-ID": sessionId,
          },
        });
        const data = await res.json();

        const historyMessages: Message[] = data.history
          .map((msg: any) => {
            if (msg.id[2] === "HumanMessage") {
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
    getHistory();
  }, [sessionId]);

  // Tool implementations
  const tools: { [key: string]: any } = {
    sendMove: async ({
      recipientAddress,
      amount,
    }: {
      recipientAddress: string;
      amount: string;
    }): Promise<string> => {
      try {
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
      } catch (error) {
        return `Error sending MOVE: ${(error as Error).message}`;
      }
    },
    deployMemeCoin: async ({
      name,
      symbol,
      initialSupply,
    }: {
      name: string;
      symbol: string;
      initialSupply: string;
    }): Promise<string> => {
      try {
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
      } catch (error) {
        return `Error sending MOVE: ${(error as Error).message}`;
      }
      return `Memecoin with ${name} ${symbol} ${initialSupply}`;
    },
    txHashSummary: async ({ hash }: { hash: string }): Promise<string> => {
      return `Transaction ${hash} summary: Mock summary data.`;
    },
    addressInfo: async ({ address }: { address: string }): Promise<string> => {
      return `Address ${address} info: Balance: 1000 MOVE, Transactions: 42`;
    },
  };

  const executeAction = async (action: ToolCall) => {
    const tool = tools[action.name];
    if (!tool) {
      return `Tool ${action.name} not found`;
    }
    return await tool(action.args ? action.args : {});
  };

  // LocalStorage helpers for tool messages
  const lastToolAIMsgKey = "last_tool_ai_msgs";

  const saveLastToolAIMsg = (msgs: string[]) => {
    localStorage.setItem(lastToolAIMsgKey, JSON.stringify(msgs));
  };

  const deleteLastToolAIMsg = () => {
    localStorage.removeItem(lastToolAIMsgKey);
  };

  const getLastToolAIMsg = (): string[] => {
    const stored = localStorage.getItem(lastToolAIMsgKey);
    if (stored) return JSON.parse(stored);
    return [];
  };

  const handleSendWithPayment = async (): Promise<AiResponseType | null> => {
    const input = userInput.trim();
    if (!input && !selectedImage) return null;

    if (!isConnected) {
      toast.error("Connect wallet first");
      return null;
    }

    const loadingToast = toast.loading("Processing...");

    try {
      const query = input;
      const res = await fetch(`${SERVER_URL}/api/ai-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": sessionId,
        },
        body: JSON.stringify({
          task: query,
          lastToolAIMsg: getLastToolAIMsg(),
        }),
      });

      let responseData;
      if (res.status === 402) {
        const { accepts } = await res.json();
        if (!accepts?.[0]) throw new Error("No payment requirements");

        toast.loading("Sign in wallet...", { toastId: loadingToast });
        const xPayment = await payForAccess(accepts[0]);

        toast.loading("Processing payment...", { toastId: loadingToast });
        const paidRes = await fetch(`${SERVER_URL}/api/ai-agent`, {
          headers: {
            "X-PAYMENT": xPayment,
            "X-Session-ID": sessionId,
            "Content-Type": "application/json",
          },
          redirect: "manual",
          method: "POST",
          body: JSON.stringify({
            task: query,
            lastToolAIMsg: getLastToolAIMsg(),
          }),
        });

        deleteLastToolAIMsg();

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

        const results: string[] = [paidResult.content];
        const toolsResults: string[] = [];

        for (const toolCall of paidResult.tool_calls) {
          const result = await executeAction(toolCall);
          results.push(result);
          toolsResults.push(result);
        }

        saveLastToolAIMsg(toolsResults);
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

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FaUser className="w-4 h-4 text-white" />
            </div>

            <button className="p-2 hover:bg-gray-700 rounded">
              <FaEllipsisV className="w-4 h-4 text-gray-400" />
            </button>
          </div>
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
                    className={`inline-block max-w-[80%] p-4 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-[#28334e] text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                    }`}
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
                      className="prose prose-sm max-w-none"
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
