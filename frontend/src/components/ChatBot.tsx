import React, { useState, useEffect, useRef } from "react";
import { AIAgent } from "../agent/index";
import { toast } from "react-toastify";
import { FaSpinner, FaQuestionCircle, FaComment } from "react-icons/fa";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SERVER_URL } from "../utils/constants";
import { useX402Payment } from "../hooks/use-x402";
import { AiResponseType, ToolCall } from "../types";
import { v4 as uuidv4 } from "uuid"; // npm install uuid @types/uuid
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const ChatWithAdminBot = () => {
  type Message = {
    text: string;
    sender: "user" | "bot"; // adjust based on your app
  };
  const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const agent = new AIAgent();

  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { payForAccess, isConnected } = useX402Payment();
  const toggleRef = useRef<HTMLDivElement | null>(null);
  const helpRef = useRef<HTMLDivElement | null>(null);
  const [_, setIsLoading] = useState(false);
  const { account, signAndSubmitTransaction } = useWallet();

  const [sessionId] = useState(() => {
    // Check if session exists in localStorage
    const stored = localStorage.getItem("ai_session_id");
    if (stored) return stored;

    // Generate new session ID
    const newId = uuidv4();
    localStorage.setItem("ai_session_id", newId);
    return newId;
  });

  useEffect(() => {
    const getHistory = async () => {
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
            return { text: msg.kwargs.content, sender: "user" };
          } else if (msg.id[2] === "AIMessage") {
            return { text: msg.kwargs.content, sender: "bot" };
          }
          return null;
        })
        .filter((msg: Message | null): msg is Message => msg !== null);

      setMessages(historyMessages);
    };
    getHistory();
  }, []);

  const handleSendWithPayment: () => Promise<AiResponseType | null> =
    async () => {
      const input = userInput.trim();
      if (!input) return;

      if (!isConnected) {
        return toast.error("Connect wallet first");
      }

      setIsLoading(true);

      const loadingToast = toast.loading("Processing...");

      try {
        // 1️⃣ Optional: check if payment required
        const query = input; // or combine with lastUserInput if needed
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

          // 2️⃣ Sign payment
          toast.loading("Sign in wallet...", { toastId: loadingToast });
          console.log("Payment requirements:", accepts[0]);
          const xPayment = await payForAccess(accepts[0]);

          console.log("X-PAYMENT:", xPayment);

          // 3️⃣ Submit payment
          toast.loading("Processing payment...", { toastId: loadingToast });
          console.log(`Submitting payment with X-PAYMENT: ${xPayment}`);
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
      } finally {
        setIsProcessing(false);
        setIsLoading(false);
        toast.dismiss(loadingToast);
      }
    };

  const toggleChatbox = () => {
    setIsChatboxOpen((prev) => !prev);
  };

  const toggleHelp = () => {
    setIsHelpOpen((prev) => !prev);
  };

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        toggleRef.current &&
        toggleRef.current.contains(event.target as Node)
      ) {
        return;
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
    }

    if (isHelpOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHelpOpen]);

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
        console.log("Transaction result:", result);
        return `Sent ${amount} MOVE to ${recipientAddress}. Transaction hash: ${result.hash}`;
      } catch (error) {
        return `Error sending MOVE: ${(error as Error).message}`;
      }
    },
    txHashSummary: async ({ hash }: { hash: string }) => {
      try {
        const response = await fetch(
          `https://api.aptoscan.io/api/v1/tx/${hash}`
        );
        const data = await response.json();
        return JSON.stringify(data);
      } catch (error) {
        return `Error fetching transaction details: ${
          (error as Error).message
        }`;
      }
    },
    addressInfo: async ({ address }: { address: string }) => {
      try {
        const response = await fetch(
          `https://api.aptoscan.io/api/v1/account/${address}`
        );
        const data = await response.json();
        return JSON.stringify(data);
      } catch (error) {
        return `Error fetching account details: ${(error as Error).message}`;
      }
    },
  };
  const toolsInfo: { [key: string]: string } = {
    sendMove:
      "Example: Send 10 MOVE to 0x56700360ae32507d9dc80819c029417f7d2dfbd1d37a5f7225ee940a8433b9c8",
    txHashSummary: "Example: Get a summary of transaction hash 0xabc123... ",
    addressInfo:
      "Example: Get info about address 0x56700360ae32507d9dc80819c029417f7d2dfbd1d37a5f7225ee940a8433b9c8",
  };

  const executeAction = async (action: ToolCall) => {
    const tool = tools[action.name];
    if (!tool) {
      return `Tool ${action.name} not found`;
    }
    return await tool.bind(this)(action.args ? action.args : {});
  };

  const handleSend = async () => {
    if (userInput.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: userInput, sender: "user" },
      ]);
      setUserInput("");

      try {
        setIsProcessing(true);
        const paidResult = await handleSendWithPayment();
        if (!paidResult) {
          setIsProcessing(false);
          return;
        }
        const { results } = await agent.solveTask(paidResult);
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

  const respondToUser = (response: string[]) => {
    setTimeout(() => {
      response.map((res) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: res, sender: "bot" },
        ]);
      });
    }, 500);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div>
      {/* Chatbot Button */}
      <div className="fixed bottom-24 right-4 mb-4 mr-10">
        <button
          onClick={toggleChatbox}
          className="bg-[#28334e] text-white py-2 px-4 rounded-full hover:bg-[#1f2937] transition duration-300 flex items-center h-12 cursor-pointer"
        >
          <FaComment className="w-6 h-6" />
        </button>
      </div>

      {/* Help Button (Floating) */}
      <div className="fixed bottom-40 right-4 mb-4 mr-10" ref={toggleRef}>
        <button
          onClick={toggleHelp}
          className="bg-[#28334e] text-white py-2 px-4 rounded-full hover:bg-[#1f2937] transition duration-300 flex items-center h-12 cursor-pointer"
        >
          <FaQuestionCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Help Popover */}
      {isHelpOpen && (
        <div
          ref={helpRef}
          className="fixed bottom-52 right-4 bg-white shadow-lg rounded-lg p-4 z-50 mb-4 mr-4
    w-72 max-h-60 overflow-y-auto sm:w-80 sm:max-h-80 md:w-96 lg:w-[28rem]"
        >
          <h3 className="text-lg font-semibold text-gray-700">Commands</h3>
          <ul className="list-disc ml-5 mt-2 text-gray-600 break-words">
            {Object.keys(toolsInfo).map((key, index) => (
              <li key={index}>
                <strong>{key}:</strong> {toolsInfo[key]}.
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Chatbox */}
      {isChatboxOpen && (
        <div className="fixed bottom-24 right-4 w-96 z-50">
          <div className="bg-white shadow-md rounded-lg max-w-lg w-full relative">
            {/* Chatbox Header */}
            <div className="p-4 border-b bg-[#28334e] text-white rounded-t-lg flex justify-between items-center">
              <p className="text-lg font-semibold">AI Agent</p>
              <button
                onClick={toggleChatbox}
                className="text-gray-300 hover:text-gray-400 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 h-80 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-2 flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`${
                      message.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    } rounded-lg py-2 px-4 max-w-[80%] break-words`}
                  >
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </Markdown>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t flex">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleInputKeyPress}
                placeholder="Type a message"
                className="w-full px-3 py-2 border text-black rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#28334e]"
              />
              <button
                onClick={handleSend}
                className="bg-[#28334e] text-white px-4 py-2 rounded-r-md hover:bg-[#1f2937] transition duration-300"
              >
                {isProcessing ? (
                  <FaSpinner className="w-5 h-5 animate-spin" />
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWithAdminBot;
