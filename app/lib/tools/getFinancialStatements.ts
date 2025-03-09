import { tool } from "ai";
import { z } from "zod";
import { stockApiConfig } from "../config/apiConfig";

const statementTypes = ['balance-sheet-statement', 'income-statement', 'cash-flow-statement'] as const;
type StatementType = typeof statementTypes[number];

// Common function to fetch financial statements
async function fetchFinancialStatement(symbol: string, statementType: StatementType) {
  try {
    const url = stockApiConfig.buildUrl(`/${statementType}/${symbol}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length === 0) {
      return {
        success: false,
        error: `No ${statementType} found for symbol ${symbol}`
      };
    }
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Error fetching ${statementType}:`, error);
    return {
      success: false,
      error: `Failed to fetch ${statementType}`
    };
  }
}

export const getFinancialStatementsTool = tool({
  description: 'Gets financial statements (balance sheet, income statement, or cash flow statement) for a company',
  parameters: z.object({
    symbol: z.string().describe('Stock symbol (e.g., AAPL, MSFT)'),
    statementType: z.enum(statementTypes).describe('Type of financial statement to retrieve')
  }),
  execute: async ({ symbol, statementType }) => {
    return fetchFinancialStatement(symbol, statementType);
  }
});

// Helper tools for specific statement types
export const getBalanceSheetTool = tool({
  description: 'Gets balance sheet statement for a company',
  parameters: z.object({
    symbol: z.string().describe('Stock symbol (e.g., AAPL, MSFT)')
  }),
  execute: async ({ symbol }) => {
    return fetchFinancialStatement(symbol, 'balance-sheet-statement');
  }
});

export const getIncomeStatementTool = tool({
  description: 'Gets income statement for a company',
  parameters: z.object({
    symbol: z.string().describe('Stock symbol (e.g., AAPL, MSFT)')
  }),
  execute: async ({ symbol }) => {
    return fetchFinancialStatement(symbol, 'income-statement');
  }
});

export const getCashFlowStatementTool = tool({
  description: 'Gets cash flow statement for a company',
  parameters: z.object({
    symbol: z.string().describe('Stock symbol (e.g., AAPL, MSFT)')
  }),
  execute: async ({ symbol }) => {
    return fetchFinancialStatement(symbol, 'cash-flow-statement');
  }
});
