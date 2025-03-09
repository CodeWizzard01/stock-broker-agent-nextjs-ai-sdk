import { tool } from "ai";
import { z } from "zod";
import { stockApiConfig } from "../config/apiConfig";

export const getCompanyProfileTool = tool({
  description: 'Gets detailed company profile information for a stock symbol',
  parameters: z.object({
    symbol: z.string().describe('Stock symbol (e.g., AAPL, MSFT)')
  }),
  execute: async ({ symbol }) => {
    try {
      const url = stockApiConfig.buildUrl(`/profile/${symbol}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length === 0) {
        return {
          success: false,
          error: `No company profile found for symbol ${symbol}`
        };
      }
      
      return {
        success: true,
        data: data[0]
      };
    } catch (error) {
      console.error('Error fetching company profile:', error);
      return {
        success: false,
        error: 'Failed to fetch company profile'
      };
    }
  }
});
