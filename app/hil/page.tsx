"use client";

import { useChat } from "@ai-sdk/react";
import ReactMarkdown from 'react-markdown';
import { APPROVAL, getToolsRequiringConfirmation } from '../lib/util/hil-utils';

// Import tools so we can check which ones require confirmation
import {
  createStockOrderToolWithConfirmation,
  getCompanyProfileTool,
  getStockQuoteTool,
  webSearchTool,
  getPortfolioPositionsTool,
} from "../lib/tools";

export default function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    addToolResult
  } = useChat({
    api: "/api/chat-hil"
  });

  const isLoading = status === "submitted";
  
  const tools = {
    createStockOrderWithConfirmation: createStockOrderToolWithConfirmation,
    getCompanyProfile: getCompanyProfileTool,
    getStockQuote: getStockQuoteTool,
    webSearch: webSearchTool,
    getPortfolioPositions: getPortfolioPositionsTool,
  };

  const toolsRequiringConfirmation = getToolsRequiringConfirmation(tools);

  // Check if there's a pending tool confirmation
  const pendingToolCallConfirmation = messages.some(m =>
    m.parts?.some(
      part =>
        part.type === 'tool-invocation' &&
        part.toolInvocation.state === 'call' &&
        toolsRequiringConfirmation.includes(part.toolInvocation.toolName),
    ),
  );

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
                  case "text":
                    return (
                      <div
                        key={partIndex}
                        className="text-base leading-relaxed"
                      >
                        <ReactMarkdown>{part.text}</ReactMarkdown>
                      </div>
                    );
                  case "tool-invocation":
                    const toolInvocation = part.toolInvocation;
                    const toolCallId = toolInvocation.toolCallId;

                    // Handle confirmation for tools that require it
                    if (
                      toolsRequiringConfirmation.includes(
                        toolInvocation.toolName
                      ) &&
                      toolInvocation.state === "call"
                    ) {
                      const { symbol, quantity, price, orderType } =
                        toolInvocation.args;

                      return (
                        <div
                          key={partIndex}
                          className="my-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg"
                        >
                          <h4 className="text-lg font-medium text-yellow-800 mb-2">
                            Confirm Stock Order
                          </h4>
                          <div className="mb-3">
                            <p className="text-gray-700">
                              <strong>Action:</strong> {orderType} {quantity}{" "}
                              shares of {symbol} at ${price} per share
                            </p>
                            <p className="text-gray-700 mt-1">
                              <strong>Total Value:</strong> $
                              {(quantity * price).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Please confirm if you want to proceed with this
                            order.
                          </p>
                          <div className="flex gap-3">
                            <button
                              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              onClick={() =>
                                addToolResult({
                                  toolCallId,
                                  result: APPROVAL.YES,
                                })
                              }
                            >
                              Confirm Order
                            </button>
                            <button
                              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                              onClick={() =>
                                addToolResult({
                                  toolCallId,
                                  result: APPROVAL.NO,
                                })
                              }
                            >
                              Cancel Order
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return null;
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
          disabled={pendingToolCallConfirmation}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim() || pendingToolCallConfirmation}
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
          <li>Buy 10 shares of Amazon at market price</li>
          <li>Show my portfolio positions</li>
        </ul>
      </div>
    </div>
  );
}
