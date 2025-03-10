import { openai } from "@ai-sdk/openai";
import { createDataStreamResponse, streamText } from "ai";
import {
  getCompanyProfileTool,
  getStockQuoteTool,
  webSearchTool,
  getPortfolioPositionsTool,
  getFinancialStatementsTool,
  getBalanceSheetTool,
  getIncomeStatementTool,
  getCashFlowStatementTool,
  createStockOrderToolWithConfirmation,
} from "../../lib/tools";
import { processToolCalls } from "../../lib/util/hil-utils";
import { OrderType, stockOrders } from "../../lib/db";

// Define all tools in a single object
const tools = {
  createStockOrderWithConfirmation: createStockOrderToolWithConfirmation,
  getCompanyProfile: getCompanyProfileTool,
  getStockQuote: getStockQuoteTool,
  webSearch: webSearchTool,
  getPortfolioPositions: getPortfolioPositionsTool,
  getFinancialStatements: getFinancialStatementsTool,
  getBalanceSheet: getBalanceSheetTool,
  getIncomeStatement: getIncomeStatementTool,
  getCashFlowStatement: getCashFlowStatementTool,
};

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async dataStream => {
      // Process messages for any tool calls that require human confirmation
      const processedMessages = await processToolCalls(
        {
          messages,
          dataStream,
          tools,
        },
        {
          // Implementation for createStockOrderWithConfirmation
          createStockOrderWithConfirmation: async ({ userId, symbol, quantity, price, orderType }) => {
            try {
              const order = await stockOrders.create({
                userId,
                symbol,
                quantity,
                price,
                orderType: orderType as OrderType,
              });

              return {
                success: true,
                orderId: order.id,
                message: `Successfully created ${orderType} order for ${quantity} shares of ${symbol} at $${price} per share.`,
              };
            } catch (error) {
              console.error("Error creating stock order:", error);
              return {
                success: false,
                error: "Failed to create stock order"
              };
            }
          },
        },
      );

      const result = streamText({
        model: openai("gpt-4o"),
        maxSteps: 10,
        messages: processedMessages,
        system: `
          You are a polite stock advisor assistant who provides advice based on 
          the latest stock price, company information and financial results.
          When suggesting a stock order, always use createStockOrderWithConfirmation tool.
          All your responses should be in markdown format.
          When you are returning a list of items like position, orders, list of stocks etc, return them in a table format.
        `,
        tools,
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
