"use client";

import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, status } =
    useChat();

  const isLoading = status === "submitted";

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 h-[90vh]">
      <h1 className="text-2xl font-bold mb-4">Stock Management Assistant</h1>

      <div className="flex-1 overflow-y-auto mb-4 border rounded-md p-4 bg-white">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center py-8 text-lg">
            Start a conversation to get stock information and trading assistance
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`mb-6 p-5 rounded-lg shadow-sm ${
              message.role === "user"
                ? "bg-blue-50 border-l-4 border-blue-500"
                : "bg-slate-50 border-l-4 border-slate-500"
            }`}
          >
            <div className="font-bold mb-3 text-gray-800 text-lg">
              {message.role === "user" ? "You" : "Assistant"}
            </div>

            <div className="text-gray-800 prose prose-slate max-w-none">
              {message.parts?.map((part, partIndex) => {
                switch (part.type) {
                  // Regular text content
                  case "text":
                    return (
                      <div
                        key={partIndex}
                        className="text-base leading-relaxed"
                      >
                        <ReactMarkdown>{part.text}</ReactMarkdown>
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <div className="animate-pulse flex space-x-1">
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
            </div>
            <div className="text-gray-600 font-medium">
              Assistant is thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about stocks, place orders, or get market information..."
          className="flex-1 p-4 text-base text-white bg-gray-800 border-2 border-gray-600 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md disabled:bg-blue-300 transition-colors"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>

      <div className="mt-5 p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="font-medium text-gray-700 mb-2">Example queries:</p>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>What is the current stock price of Apple?</li>
          <li>Tell me about Microsoft company profile</li>
          <li>How is Amazon stock performing today?</li>
          <li>Show my portfolio positions</li>
        </ul>
      </div>
    </div>
  );
}
