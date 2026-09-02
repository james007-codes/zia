import { useEffect, useState } from "react";
import {
  getConversations,
  createConversation,
  getConversationMessages,
  sendAIMessage,
} from "../services/aiService.js";
import { logout } from "../services/authService.js";

export default function AIAssistant({ user, onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     LOAD CONVERSATIONS
  ========================= */

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setError("");

      const data = await getConversations();

      setConversations(data || []);

      if (data && data.length > 0) {
        await selectConversation(data[0]);
      } else {
        await handleNewConversation();
      }
    } catch (err) {
      setError(err.message || "Failed to load conversations");
    }
  };

  /* =========================
     SELECT CONVERSATION
  ========================= */

  const selectConversation = async (conversation) => {
    try {
      setCurrentConversation(conversation);
      setLoadingMessages(true);
      setError("");

      const data = await getConversationMessages(
        conversation._id || conversation.id
      );

      setMessages(data || []);
    } catch (err) {
      setError(err.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  /* =========================
     NEW CONVERSATION
  ========================= */

  const handleNewConversation = async () => {
    try {
      setError("");

      const conversation = await createConversation();

      setConversations((prev) => [
        conversation,
        ...prev,
      ]);

      setCurrentConversation(conversation);
      setMessages([]);
    } catch (err) {
      setError(
        err.message || "Failed to create conversation"
      );
    }
  };

  /* =========================
     SEND MESSAGE
  ========================= */

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = input.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    if (!currentConversation) {
      setError("No conversation selected");
      return;
    }

    const conversationId =
      currentConversation._id ||
      currentConversation.id;

    const userMessage = {
      role: "user",
      content: trimmedMessage,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await sendAIMessage(
        trimmedMessage,
        conversationId
      );

      const aiMessage = {
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);
    } catch (err) {
      setError(
        err.message || "Failed to get AI response"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    logout();
    onLogout();
  };

  /* =========================
     FORMAT MESSAGE
  ========================= */

  const getMessageText = (message) => {
    return (
      message.content ||
      message.message ||
      message.text ||
      ""
    );
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="h-screen bg-slate-100 flex overflow-hidden">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="w-72 bg-slate-900 text-white flex flex-col">

        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold">
            ZIA
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            AI Healthcare Assistant
          </p>
        </div>

        <div className="p-4">
          <button
            onClick={handleNewConversation}
            className="w-full bg-white text-slate-900 rounded-lg py-3 font-semibold hover:bg-slate-200 transition"
          >
            + New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <p className="text-xs uppercase tracking-wider text-slate-500 px-3 py-2">
            Conversations
          </p>

          {conversations.length === 0 ? (
            <p className="text-sm text-slate-500 px-3 py-4">
              No conversations yet
            </p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => {
                const id =
                  conversation._id ||
                  conversation.id;

                const isActive =
                  (currentConversation?._id ||
                    currentConversation?.id) === id;

                return (
                  <button
                    key={id}
                    onClick={() =>
                      selectConversation(conversation)
                    }
                    className={`w-full text-left px-3 py-3 rounded-lg text-sm transition ${
                      isActive
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {conversation.title ||
                      conversation.name ||
                      "New Conversation"}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* USER / LOGOUT */}

        <div className="p-4 border-t border-slate-700">
          <div className="mb-3">
            <p className="text-sm font-semibold">
              {user?.name ||
                user?.email ||
                "User"}
            </p>

            <p className="text-xs text-slate-400 capitalize">
              {user?.role || "user"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full border border-slate-600 text-slate-300 rounded-lg py-2.5 text-sm hover:bg-slate-800 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* =========================
          CHAT AREA
      ========================= */}

      <main className="flex-1 flex flex-col min-w-0">

        {/* HEADER */}

        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {currentConversation?.title ||
              "AI Assistant"}
          </h2>

          <p className="text-sm text-slate-500">
            Ask ZIA anything about your healthcare needs.
          </p>
        </header>

        {/* ERROR */}

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* MESSAGES */}

        <div className="flex-1 overflow-y-auto p-6">

          {loadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-400">
                Loading conversation...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">

              <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold mb-5">
                Z
              </div>

              <h3 className="text-2xl font-bold text-slate-900">
                How can I help you?
              </h3>

              <p className="text-slate-500 mt-2 max-w-md">
                Ask me a healthcare-related question and
                I'll do my best to assist you.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-5">

              {messages.map((message, index) => {
                const isUser =
                  message.role === "user";

                return (
                  <div
                    key={message._id || index}
                    className={`flex ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                        isUser
                          ? "bg-slate-900 text-white"
                          : "bg-white border border-slate-200 text-slate-800"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-6">
                        {getMessageText(message)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* INPUT */}

        <div className="bg-white border-t border-slate-200 p-4">
          <form
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder="Ask ZIA something..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-100"
            />

            <button
              type="submit"
              disabled={
                loading ||
                !input.trim() ||
                !currentConversation
              }
              className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}