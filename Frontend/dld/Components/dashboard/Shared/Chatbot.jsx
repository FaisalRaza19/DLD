"use client";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/Context/Context.jsx";
import { FiX, FiSend, FiUser, FiRefreshCw } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";
import { fetchGPTResponse } from "@/Components/GPT_Api.js";

const Chatbot = ({ isOpen, onClose }) => {
  const { userData, Cases } = useApp();
  const user = userData;
  const { cases } = Cases;

  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 1,
          type: "bot",
          content: `Hello ${user?.fullName || "there"}! I'm your Legal Assistant. How can I assist you today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, user?.fullName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const generateCaseSummary = (caseId) => {
    const case_ = cases.find((c) => c?._id.toString() === caseId?.toString());
    if (!case_) return `Case with ID #${caseId} not found.`;
    return `**Case Summary: ${case_?.caseTitle}**\n\n- **Type:** ${case_?.caseType || "N/A"}\n- **Status:** ${case_?.status || "N/A"}\n- **Client:** ${case_?.client?.fullName || "N/A"}\n- **Description:** ${case_?.caseDescription || "No description."}\n- **Documents:** ${case_?.caseDocs?.length || 0} file(s)`;
  };

  const getContextData = () => ({
    totalCases: cases?.length,
    selectedCase: selectedCaseId ? cases.find((c) => c._id === selectedCaseId) : null,
    recentCases: cases?.slice(-3).map((c) => ({ id: c._id, title: c.caseTitle, status: c.status })),
  });

  const addMessage = (type, content) => {
    setMessages((prev) => [...prev, { id: Date.now(), type, content, timestamp: new Date() }]);
  };

  const handleSendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || isLoading) return;

    addMessage("user", trimmedMessage);
    setInputMessage("");
    setIsLoading(true);

    const isSummaryRequest =
      trimmedMessage.toLowerCase().includes("summarize") ||
      trimmedMessage.toLowerCase().includes("summary");

    if (selectedCaseId && isSummaryRequest) {
      const summary = generateCaseSummary(selectedCaseId);
      addMessage("bot", summary);
      setIsLoading(false);
      return;
    }

    try {
      const context = getContextData();
      const gptResponse = await fetchGPTResponse(trimmedMessage, context);
      addMessage("bot", gptResponse);
    } catch {
      addMessage("bot", "Oops! Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (caseId) => {
    setSelectedCaseId(caseId);
    const summary = generateCaseSummary(caseId);
    const caseTitle = cases.find((c) => c._id === caseId)?.caseTitle;
    addMessage("user", `Tell me about the case: "${caseTitle}"`);

    setIsLoading(true);
    setTimeout(() => {
      addMessage("bot", summary);
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content: `Hello ${user?.fullName || "there"}! I'm your Legal Assistant. How can I assist you today?`,
        timestamp: new Date(),
      },
    ]);
  };

  const formatMessage = (content) =>
    String(content).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="rounded-xl w-full max-w-3xl h-[90vh] max-h-[700px] flex flex-col shadow-xl bg-white border border-black">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-black">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center">
              <FiUser className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black">Legal Assistant</h3>
              <p className="text-sm text-gray-600">AI-powered legal support</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clearChat} className="p-2 rounded-lg hover:bg-gray-200 transition" title="Clear Chat">
              <FiRefreshCw className="h-4 w-4 text-black" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 transition" title="Close">
              <FiX className="h-5 w-5 text-black" />
            </button>
          </div>
        </div>

        {/* Case Selection */}
        <div className="p-4 border-b border-black space-y-2">
          <label className="text-sm font-medium text-black">Select a Case for Context:</label>
          <select
            value={selectedCaseId || ""}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full mt-1 p-2 rounded-lg border border-black text-black"
          >
            <option value="">-- No specific case --</option>
            {cases?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.caseTitle} ({c.status})
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2 pt-2">
            {cases?.slice(-3).reverse().map((c) => (
              <button
                key={c._id}
                onClick={() => handleQuickSelect(c._id)}
                className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                {c.caseTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              {msg.type === "bot" && (
                <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                  <FaRobot className="h-4 w-4" />
                </div>
              )}
              <div className={`max-w-[80%] p-3 rounded-lg ${msg.type === "user" ? "bg-black text-white" : "bg-gray-100 text-black"}`}>
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                <div className="text-xs opacity-70 mt-2 text-right">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              {msg.type === "user" && (
                <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                  <FiUser className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                <FaRobot className="h-4 w-4" />
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-black">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition"
            >
              <FiSend className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
