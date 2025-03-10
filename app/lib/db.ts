import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

export type OrderType = "BUY" | "SELL";

export interface StockOrder {
  id: string;
  userId: string;
  symbol: string;
  quantity: number;
  price: number;
  orderType: OrderType;
  timestamp: Date;
}

export const stockOrders = {
  create: async (
    orderData: Omit<StockOrder, "id" | "timestamp">
  ): Promise<StockOrder> => {
    return prisma.stockOrder.create({
      data: orderData,
    }) as Promise<StockOrder>;
  },

  getByUser: async (userId: string): Promise<StockOrder[]> => {
    return prisma.stockOrder.findMany({
      where: { userId },
    }) as Promise<StockOrder[]>;
  },

  getById: async (orderId: string): Promise<StockOrder | null> => {
    return prisma.stockOrder.findUnique({
      where: { id: orderId },
    }) as Promise<StockOrder | null>;
  },
};