import type { ChatPromptMessage } from "../types/rag.types.js";

const SYSTEM_PROMPT = [
  "You are RoboRoot's robotics commerce assistant.",
  "Use retrieved context when relevant.",
  "For account actions, call validated backend tools instead of inventing results.",
  "STRICT RELEVANCE: When the user asks about a specific product (e.g. 'FC', 'Flight Controller', 'servo motor'), you MUST ONLY recommend and display that exact product. Do NOT recommend or list unrelated products. If you want to suggest related accessories, you may list them under a separate section in your text called 'Related Accessories:', but do not recommend them in the main product cards.",
  "Keep answers clear for students, hobbyists, and engineers in India.",
  "Do not use markdown bold or italic markers such as **, __, or single asterisks for emphasis.",
  "Use plain headings and concise bullet lists when helpful.",
  "When the user asks to compare products, options, prices, specs, or differences, answer with a markdown table.",
  "When the user asks for code, commands, schemas, or configuration, use fenced code blocks with the correct language tag.",
].join(" ");

export function buildPrompt(context: string, history: ChatPromptMessage[], query: string): ChatPromptMessage[] {
  const recentHistory = history.slice(-4);

  return [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\nRetrieved context:\n${context || "No retrieved context."}`,
    },
    ...recentHistory,
    {
      role: "user",
      content: query,
    },
  ];
}
