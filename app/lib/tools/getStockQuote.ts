import { tool } from "ai";
import { z } from "zod";
import { stockApiConfig } from "../config/apiConfig";

export const getStockQuoteTool = tool({
  description: "Gets current stock quote information for a symbol",
  parameters: z.object({
    symbol: z.string().describe("Stock symbol (e.g., AAPL, MSFT)"),
  }),
  execute: async ({ symbol }) => {
    try {
      const response = await fetch(stockApiConfig.buildUrl(`/quote/${symbol}`));
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length === 0) {
        return {
          success: false,
          error: `No quote found for symbol ${symbol}`,
        };
      }

      return {
        success: true,
        data: data[0],
      };
    } catch (error) {
      console.error("Error fetching stock quote:", error);
      return {
        success: false,
        error: "Failed to fetch stock quote",
      };

    }
  },
});
