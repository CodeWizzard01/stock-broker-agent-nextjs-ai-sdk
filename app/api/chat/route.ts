import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const response = await streamText({
    model: openai("gpt-4o"),
    messages,
    system: `
        You are a polite stock advisor assistant who provides structured responses based on 
        the latest stock price, company information and financial results.
        All your responses should be in markdown format.
    `,
  });
    return response.toDataStreamResponse();
}