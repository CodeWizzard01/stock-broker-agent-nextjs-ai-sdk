# Stock Management Agent

A simple stock management assistant built with Next.js, AI SDK, and OpenAI. This application provides real-time stock information, financial analysis, portfolio management, and trading capabilities with human-in-the-loop functionality for critical operations.


## Features

- 📈 **Real-time Stock Quotes**: Get up-to-date stock prices and market data
- 🏢 **Company Profiles**: Access detailed company information and financial reports
- 📊 **Financial Analysis**: View and analyze financial statements (balance sheets, income statements, cash flow)
- 💼 **Portfolio Management**: Keep track of your investment positions
- 🛒 **Order Execution**: Place buy and sell orders with optional human approval
- 🔍 **Market Research**: Search for the latest information on stocks and market trends
- 🤖 **AI-powered Assistance**: Get intelligent insights and recommendations

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **AI**: Vercel AI SDK, OpenAI GPT-4o
- **Database**: PostgreSQL with Prisma ORM
- **APIs**: Financial Modeling Prep API, Tavily Search API

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Financial Modeling Prep API key
- Tavily API key
- PostgreSQL database

## Environment Setup

Create a `.env.local` file in the project root with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
FINANCIAL_MODELING_PREP_API_KEY=your_financial_modeling_prep_api_key
TAVILY_API_KEY=your_tavily_api_key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stock_management
```

## Quick Start

### Using Docker for Database (Recommended)

Create a `docker-compose.yml` file in the project root:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: stock_management_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: stock_management
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - stock_network

  pgadmin:
    image: dpage/pgadmin4
    container_name: stock_management_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - stock_network

networks:
  stock_network:
    driver: bridge

volumes:
  postgres_data:
```

Start the database:

```bash
docker-compose up -d
```

### Application Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
stock-management-agent/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts       # AI chat endpoint without human-in-the-loop
│   │   └── chat-hil/
│   │       └── route.ts       # AI chat endpoint with human-in-the-loop
│   ├── hil/
│   │   └── page.tsx           # Human-in-the-loop chat interface
│   ├── layout.tsx
│   └── page.tsx               # Main chat interface
├── lib/
│   ├── config/
│   │   └── apiConfig.ts       # API configuration for financial data
│   ├── tools/
│   │   ├── createStockOrder.ts
│   │   ├── getCompanyProfile.ts
│   │   ├── getFinancialStatements.ts
│   │   ├── getPortfolioPositions.ts
│   │   ├── getStockQuote.ts
│   │   ├── webSearch.ts
│   │   └── index.ts
│   ├── util/
│   │   ├── middleware.ts      # AI SDK middleware for logging
│   │   └── hil-utils.ts       # Utility functions for human-in-the-loop
│   └── db.ts                  # Database functions and types
└── prisma/
    └── schema.prisma          # Database schema
```

## Available Endpoints

- `/api/chat`: Endpoint for autonomous AI chat
- `/api/chat-hil`: Endpoint with human-in-the-loop functionality

## Available Pages

- `/`: Main chat interface for autonomous AI assistance
- `/hil`: Chat interface with human-in-the-loop for critical operations

## Key Concepts

### AI Tools

The agent uses various tools to interact with external services and data sources:

- **getStockQuote**: Fetches current stock prices
- **getCompanyProfile**: Retrieves company information
- **getFinancialStatements**: Gets financial statements (balance sheet, income statement, cash flow)
- **createStockOrder**: Places buy/sell orders for stocks
- **webSearch**: Searches the web for up-to-date information

### Human-in-the-Loop

For critical operations like placing stock orders, the system can require human approval:

1. The AI suggests a stock order based on user input
2. The UI displays a confirmation prompt to the user
3. The user approves or rejects the operation
4. If approved, the operation proceeds; if rejected, it's canceled

### Middleware

The application uses middleware to intercept and modify the interactions between the application and the language model:

- **loggingMiddleware**: Logs input parameters and outputs for debugging

## Customization

### Adding New Tools

To add a new tool for the AI agent:

1. Create a new file in the `lib/tools` directory
2. Define the tool using the `tool` function from the AI SDK
3. Add the tool to the appropriate API route

Example:

```typescript
// lib/tools/myNewTool.ts
import { tool } from "ai";
import { z } from "zod";

export const myNewTool = tool({
  description: "Description of what the tool does",
  parameters: z.object({
    param1: z.string().describe("Description of parameter 1"),
    param2: z.number().describe("Description of parameter 2"),
  }),
  execute: async ({ param1, param2 }) => {
    // Tool implementation
    return {
      success: true,
      data: { result: "Some result" },
    };
  },
});
```

Then add it to the API route:

```typescript
// app/api/chat/route.ts
import { myNewTool } from "../../../lib/tools/myNewTool";

// ...existing code...

tools: {
  // ...existing tools...
  myNewTool,
},
```

## Learn More

For a comprehensive guide on how this application was built, check out the accompanying blog post:
[Building a Stock Broker Agent with Next.js, AI SDK, and OpenAI](./building-stock-management-agent.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [OpenAI](https://openai.com/)
- [Financial Modeling Prep](https://financialmodelingprep.com/)
- [Tavily](https://tavily.com/)
- [Prisma](https://www.prisma.io/)
