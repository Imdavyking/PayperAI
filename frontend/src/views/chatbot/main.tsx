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
} from "react-icons/fa";

// Mock data - replace with your actual implementation
const ChatInterface = () => {
  const [conversations, setConversations] = useState([
    { id: "1", title: "Send MOVE Tokens", timestamp: new Date() },
    {
      id: "2",
      title: "Deploy MemeCoin",
      timestamp: new Date(Date.now() - 86400000),
    },
  ]);
  const [currentConversationId, setCurrentConversationId] = useState("1");
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),

    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (userInput.trim() !== "" || selectedImage) {
      const newMessage = {
        id: Date.now().toString(),
        text: userInput,
        sender: "user",
        timestamp: new Date(),
        image: selectedImage,
      };

      setMessages((prev) => [...prev, newMessage]);
      setUserInput("");
      setSelectedImage(null);
      setIsProcessing(true);

      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: "I received your message. This is a demo response.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setIsProcessing(false);
      }, 1500);
    }
  };

  const handleNewChat = () => {
    const newConv = {
      id: Date.now().toString(),
      title: "New Conversation",
      timestamp: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setMessages([
      {
        id: "1",
        text: "Hello! How can I help you today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
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

  const handleDeleteConversation = (id) => {
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
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={handleNewChat}
            className="w-full bg-white text-[#28334e] py-2.5 px-4 rounded-lg hover:bg-gray-100 transition duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <FaPlus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Conversations List */}
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
                      // Handle edit
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

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FaUser className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">User</p>
              <p className="text-gray-400 text-xs">Premium Plan</p>
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
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
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

                {/* Message Content */}
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
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
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
                style={{
                  minHeight: "40px",
                  maxHeight: "128px",
                }}
              />

              <button
                onClick={handleSend}
                disabled={!userInput.trim() && !selectedImage}
                className={`p-2.5 rounded-xl transition duration-200 flex-shrink-0 ${
                  userInput.trim() || selectedImage
                    ? "bg-[#28334e] hover:bg-[#1f2937] text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <FaPaperPlane className="w-5 h-5" />
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
