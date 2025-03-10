import { tool } from "ai";
import { z } from "zod";
import { stockOrders, OrderType } from "../../lib/db";


export const createStockOrderTool = tool({
  description:
    "Creates a new stock order (BUY or SELL) for a specified stock symbol",
  parameters: z.object({
    userId: z.string().describe("User ID making the order"),
    symbol: z.string().describe("Stock symbol (e.g., AAPL, MSFT)"),
    quantity: z
      .number()
      .int()
      .positive()
      .describe("Number of shares to buy or sell"),
    price: z.number().positive().describe("Price per share"),
    orderType: z.enum(["BUY", "SELL"]).describe("Type of order (BUY or SELL)"),
  }),
    execute: async ({ userId, symbol, quantity, price, orderType }) => {
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
                message: `Successfully created ${orderType} order for ${quantity} shares of ${symbol} at $${price} per share.`
            };
        } catch (error) {
            console.error('Error creating stock order:', error);
            return {
                success: false,
                error: 'Failed to create stock order'
            };
        }

    }
});


