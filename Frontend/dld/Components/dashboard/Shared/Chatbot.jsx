"use client"
import { useState, useRef, useEffect } from "react"
import { useApp } from "@/Context/Context.jsx"
import { FiX, FiSend, FiUser, FiRefreshCw } from "react-icons/fi"
import { FaRobot } from "react-icons/fa";
import { fetchGPTResponse } from "@/Components/GPT_Api.js"

const Chatbot = ({ isOpen, onClose }) => {
  const { userData, Cases,theme} = useApp()
  const user = userData
  const { cases } = Cases

  const [selectedCaseId, setSelectedCaseId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 1,
          type: "bot",
          content: `Hello ${user?.fullName || "there"}! I'm your Legal Assistant. How can I assist you today?`,
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen, user?.fullName])

  // Theme helpers
  const isDark = theme === "dark"
  const modalBg = isDark ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
  const headerBg = isDark ? "border-gray-700" : "border-gray-200"
  const headerTextColor = isDark ? "text-white" : "text-gray-900"
  const mutedTextColor = isDark ? "text-gray-400" : "text-gray-500"
  const refreshButtonClass = isDark ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
  const userMessageBg = isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
  const botMessageBg = isDark ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"
  const inputClass = isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900"
  const sendButtonClass = isDark ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-600"
  const spinnerColor = isDark ? "border-blue-500 border-t-transparent" : "border-blue-600 border-t-transparent"
  const quickButtonClass = isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const generateCaseSummary = (caseId) => {
    const case_ = cases.find((c) => c?._id.toString() === caseId?.toString())
    if (!case_) return `Case with ID #${caseId} not found.`
    return `**Case Summary: ${case_?.caseTitle}**\n\n- **Type:** ${case_?.caseType || "N/A"}\n- **Status:** ${case_?.status || "N/A"}\n- **Client:** ${case_?.client?.fullName || "N/A"}\n- **Description:** ${case_?.caseDescription || "No description."}\n- **Documents:** ${case_?.caseDocs?.length || 0} file(s)`
  }

  const getContextData = () => ({
    totalCases: cases?.length,
    selectedCase: selectedCaseId ? cases.find((c) => c._id === selectedCaseId) : null,
    recentCases: cases?.slice(-3).map((c) => ({ id: c._id, title: c.caseTitle, status: c.status })),
  })

  const addMessage = (type, content) => {
    setMessages((prev) => [...prev, { id: Date.now(), type, content, timestamp: new Date() }])
  }

  const handleSendMessage = async () => {
    const trimmedMessage = inputMessage.trim()
    if (!trimmedMessage || isLoading) return

    addMessage("user", trimmedMessage)
    setInputMessage("")
    setIsLoading(true)

    // ✅ FIX: More specific logic. Only triggers summary if a case is selected AND the user asks for it.
    const isSummaryRequest = trimmedMessage.toLowerCase().includes("summarize") || trimmedMessage.toLowerCase().includes("summary")
    if (selectedCaseId && isSummaryRequest) {
      const summary = generateCaseSummary(selectedCaseId)
      addMessage("bot", summary)
      setIsLoading(false)
      return
    }

    try {
      const context = getContextData()
      const gptResponse = await fetchGPTResponse(trimmedMessage, context)
      addMessage("bot", gptResponse)
    } catch (error) {
      addMessage("bot", "Oops! Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ UX IMPROVEMENT: Clicking a recent case button now provides an instant summary.
  const handleQuickSelect = (caseId) => {
    setSelectedCaseId(caseId)
    const summary = generateCaseSummary(caseId)
    const caseTitle = cases.find(c => c._id === caseId)?.caseTitle
    addMessage("user", `Tell me about the case: "${caseTitle}"`)

    setIsLoading(true)
    setTimeout(() => { // Simulate bot "thinking" for better UX
      addMessage("bot", summary)
      setIsLoading(false)
    }, 500)
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        // ✅ FIX: Consistent use of fullName
        content: `Hello ${user?.fullName || "there"}! I'm your Legal Assistant. How can I help you today?`,
        timestamp: new Date(),
      },
    ])
  }

  const formatMessage = (content) => String(content).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg w-full max-w-2xl h-[90vh] max-h-[700px] flex flex-col shadow-2xl ${modalBg}`}>
        {/* Header and other JSX remains largely the same... */}
        {/* ... The main changes are in the logic functions above. */}
        {/* Header */}
        <div className={`flex justify-between items-center p-4 border-b ${headerBg}`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
              <FiUser className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${headerTextColor}`}>Legal Assistant</h3>
              <p className={`text-sm ${mutedTextColor}`}>AI-powered legal support</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clearChat} className={`p-2 rounded-lg transition-colors ${refreshButtonClass}`} title="Clear Chat">
              <FiRefreshCw className="h-4 w-4" />
            </button>
            <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${refreshButtonClass}`} title="Close">
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Select Case & Quick Buttons */}
        <div className={`p-4 border-b ${headerBg} space-y-2`}>
          <label className={`text-sm font-medium ${mutedTextColor}`}>Select a Case for Context:</label>
          <select value={selectedCaseId || ""} onChange={(e) => setSelectedCaseId(e.target.value)} className={`w-full mt-1 p-2 rounded-lg ${inputClass}`}>
            <option value="">-- No specific case --</option>
            {cases?.map((c) => (
              <option key={c._id} value={c._id}>{c.caseTitle} ({c.status})</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2 pt-2">
            {cases?.slice(-3).reverse().map((c) => (
              <button key={c._id} onClick={() => handleQuickSelect(c._id)} className={`text-xs px-2 py-1 rounded ${quickButtonClass}`}>
                {c.caseTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              {message.type === "bot" && (
                <div className={`h-8 w-8 rounded-full flex-shrink-0 items-center justify-center flex ${isDark ? "bg-gray-700" : "bg-gray-200"}`}><FaRobot className="h-4 w-4" /></div>
              )}
              <div className={`max-w-[80%] p-3 rounded-lg ${message.type === "user" ? userMessageBg : botMessageBg}`}>
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                <div className="text-xs opacity-70 mt-2 text-right">{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              {message.type === "user" && (
                <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex-shrink-0 items-center justify-center flex"><FiUser className="h-4 w-4" /></div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className={`h-8 w-8 rounded-full flex-shrink-0 items-center justify-center flex ${isDark ? "bg-gray-700" : "bg-gray-200"}`}><FaRobot className="h-4 w-4" /></div>
              <div className={`${botMessageBg} p-3 rounded-lg`}>
                <div className="flex items-center gap-2">
                  <div className={`animate-spin h-4 w-4 border-2 rounded-full ${spinnerColor}`}></div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${headerBg}`}>
          <div className="flex gap-2">
            <input ref={inputRef} type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask me anything..." disabled={isLoading} className={`flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${inputClass}`} />
            <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading} className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${sendButtonClass}`}>
              <FiSend className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chatbot