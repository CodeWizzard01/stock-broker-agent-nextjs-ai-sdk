import { tool } from "ai";
import { z } from "zod";
import { stockOrders } from "../../lib/db";
import { stockApiConfig } from "../config/apiConfig";


// Define types for better readability
type Order = {
  symbol: string;
  quantity: number;
  price: number;
  orderType: 'BUY' | 'SELL';
};

type Position = {
  symbol: string;
  netQuantity: number;
  costBasis: number;
  totalCost: number;
};

type PositionWithMarketValue = Position & {
  currentPrice: number | null;
  marketValue: number | null;
  mtmValue: number | null;
  mtmPercentage: number | null;
  isProfit?: boolean;
  priceError?: string;
};

type PortfolioSummary = {
  totalInvestment: number;
  totalMarketValue: number;
  totalMtmValue: number;
  totalMtmPercentage: number;
  isProfit: boolean;
};

export const getPortfolioPositionsTool = tool({
  description: 'Gets current portfolio positions with mark-to-market valuation',
  parameters: z.object({
    userId: z.string().describe('User ID to get positions for')
  }),
  execute: async ({ userId }) => {
    try {
      const orders = await stockOrders.getByUser(userId);
      
      if (!orders.length) {
        return {
          success: true,
          positions: [],
          message: "No positions found for this user."
        };
      }
      
      // Calculate positions from orders
      const positions = calculatePositionsFromOrders(orders);
      
      // Get market data and calculate valuations
      const positionsWithMarketValue = await enrichPositionsWithMarketData(positions);
      
      // Calculate portfolio summary
      const summary = calculatePortfolioSummary(positionsWithMarketValue);
      
      return {
        success: true,
        positions: positionsWithMarketValue,
        summary
      };
    } catch (error) {
      console.error('Error calculating portfolio positions:', error);
      return {
        success: false,
        error: 'Failed to calculate portfolio positions'
      };
    }
  }
});

/**
 * Calculates positions by aggregating orders by symbol
 */
function calculatePositionsFromOrders(orders: Order[]): Position[] {
  // Group and calculate positions by symbol
  const positionsBySymbol = orders.reduce((positions, order) => {
    const { symbol, quantity, price, orderType } = order;
    
    if (!positions[symbol]) {
      positions[symbol] = { 
        symbol,
        netQuantity: 0,
        costBasis: 0,
        totalCost: 0
      };
    }
    
    const position = positions[symbol];
    
    if (orderType === 'BUY') {
      updatePositionForBuyOrder(position, quantity, price);
    } else {
      updatePositionForSellOrder(position, quantity);
    }
    
    return positions;
  }, {} as Record<string, Position>);
  
  // Return only active positions (non-zero quantity)
  return Object.values(positionsBySymbol)
    .filter(position => position.netQuantity !== 0);
}

/**
 * Updates position data for a buy order
 */
function updatePositionForBuyOrder(position: Position, quantity: number, price: number): void {
  const newTotalCost = position.totalCost + (quantity * price);
  const newNetQuantity = position.netQuantity + quantity;
  
  position.netQuantity = newNetQuantity;
  position.totalCost = newTotalCost;
  position.costBasis = newNetQuantity > 0 ? newTotalCost / newNetQuantity : 0;
}

/**
 * Updates position data for a sell order
 */
function updatePositionForSellOrder(position: Position, quantity: number): void {
  position.netQuantity -= quantity;
  
  // If we've sold more than we bought, adjust the totalCost proportionally
  if (position.netQuantity <= 0) {
    position.totalCost = 0;
    position.costBasis = 0;
  } else {
    // Keep the same cost basis but adjust total cost based on remaining shares
    position.totalCost = position.costBasis * position.netQuantity;
  }
}

/**
 * Enriches positions with current market data and calculates values
 */
async function enrichPositionsWithMarketData(positions: Position[]): Promise<PositionWithMarketValue[]> {
 
  return Promise.all(positions.map(async position => {
    try {
      const response = await fetch(stockApiConfig.buildUrl(`/quote/${position.symbol}`));
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data[0]) {
        throw new Error(`No price data found for ${position.symbol}`);
      }
      
      // Calculate market values
      const currentPrice = data[0].price;
      const marketValue = position.netQuantity * currentPrice;
      const mtmValue = marketValue - position.totalCost;
      const mtmPercentage = position.totalCost > 0 
        ? (mtmValue / position.totalCost) * 100 
        : 0;
      
      return {
        ...position,
        currentPrice,
        marketValue,
        mtmValue,
        mtmPercentage,
        isProfit: mtmValue >= 0
      };
    } catch (error) {
      console.error(`Error fetching price for ${position.symbol}:`, error);
      return {
        ...position,
        currentPrice: null,
        marketValue: null,
        mtmValue: null,
        mtmPercentage: null,
        priceError: 'Could not retrieve current price'
      };
    }
  }));
}

/**
 * Calculates portfolio summary statistics
 */
function calculatePortfolioSummary(positions: PositionWithMarketValue[]): PortfolioSummary {
  // Calculate investment and market values
  const totalInvestment = positions.reduce(
    (sum, pos) => sum + (pos.totalCost || 0), 0
  );
  
  const totalMarketValue = positions.reduce(
    (sum, pos) => sum + (pos.marketValue || pos.totalCost || 0), 0
  );
  
  // Calculate P&L values
  const totalMtmValue = totalMarketValue - totalInvestment;
  const totalMtmPercentage = totalInvestment > 0 
    ? (totalMtmValue / totalInvestment) * 100 
    : 0;
  
  return {
    totalInvestment,
    totalMarketValue,
    totalMtmValue,
    totalMtmPercentage,
    isProfit: totalMtmValue >= 0
  };
}
