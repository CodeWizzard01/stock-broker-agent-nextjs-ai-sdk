import { getStockQuoteTool } from "@/app/lib/tools/getStockQuote";
import { loggingMiddleware } from "@/app/lib/util/middleware";
import { openai } from "@ai-sdk/openai";
import { streamText, wrapLanguageModel } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();
  
    const wrappedLanguageModel = wrapLanguageModel({
      model: openai("gpt-4o"),
      middleware: loggingMiddleware,
    });
  
  const response = await streamText({
    model: wrappedLanguageModel,
    messages,
    maxSteps: 10,
    system: `
        You are a polite stock advisor assistant who provides structured responses based on 
        the latest stock price, company information and financial results.
        All your responses should be in markdown format.
    `,
    tools: {
      getStockQuote: getStockQuoteTool,
    },
  });
    return response.toDataStreamResponse();
}