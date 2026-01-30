import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
  
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { db } from "@/app/db/db";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const systemPrompt = `You are an expert SQL assistant for a SQLite database.

You MUST follow this exact process:
1. ALWAYS call the schema tool first
2. THEN write a valid SQLite SELECT query based on the schema
3. THEN call the db tool to EXECUTE the query
4. THEN explain the result to the user in plain English

Rules:
- NEVER stop after calling schema
- NEVER return SQL without executing it
- Generate ONLY SELECT queries
- NO INSERT, UPDATE, DELETE, DROP
- Always use the provided schema
`
;

  const result = streamText({
    model: openai("gpt-5-nano"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(10),

    

    tools: {
      // ✅ tool names must be lowercase
      schema: tool({
        description: "Get the database schema",
        inputSchema: z.object({}),
        execute: async () => {
          // ✅ return plain SQL-like text (LLM friendly)
          return `
products(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)

sales(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount REAL NOT NULL,
  sale_date TEXT DEFAULT CURRENT_TIMESTAMP,
  customer_name TEXT NOT NULL,
  region TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id)
)
`;
        },
      }),

     db: tool({
  description: "Execute a SQLite SELECT query",
  inputSchema: z.object({
    query: z.string(),
  }),
  execute: async ({ query }) => {
    if (!query.trim().toLowerCase().startsWith("select")) {
      throw new Error("Only SELECT queries are allowed");
    }
    return await db.run(query);
  },
}),

    },
  });

  return result.toUIMessageStreamResponse();
}
