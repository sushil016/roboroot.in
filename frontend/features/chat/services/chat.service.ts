import { env } from "@/lib/env";
import type {
  ChatCitation,
  ChatOrderCard,
  ChatPaymentCard,
  ChatInvoiceCard,
  ChatProductCard,
  ChatStreamEvent,
  ChatStreamEventType,
} from "../types/chat.types";

interface StreamChatInput {
  message: string;
  sessionId: string;
  signal?: AbortSignal;
  onEvent: (event: ChatStreamEvent) => void;
}

export class ChatAuthRequiredError extends Error {
  constructor() {
    super("Please log in to use RoboRoot AI chat.");
    this.name = "ChatAuthRequiredError";
  }
}

export async function streamChat(input: StreamChatInput): Promise<void> {
  let response = await requestChat(input);

  if (response.status === 401 && await refreshAuthSession()) {
    response = await requestChat(input);
  }

  if (response.status === 401) {
    throw new ChatAuthRequiredError();
  }

  if (!response.ok || !response.body) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(errorMessage ?? `Chat request failed with status ${response.status}`);
  }

  await readStream(response, input.onEvent);
}

async function requestChat(input: StreamChatInput): Promise<Response> {
  return await fetch(`${env.apiUrl}/api/chat`, {
    method: "POST",
    credentials: "include",
    signal: input.signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: input.message,
      sessionId: input.sessionId,
    }),
  });
}

async function refreshAuthSession(): Promise<boolean> {
  try {
    const response = await fetch(`${env.apiUrl}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function readStream(response: Response, onEvent: (event: ChatStreamEvent) => void): Promise<void> {
  if (!response.body) throw new Error("Chat response did not include a stream");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const eventBlock of events) {
      const event = parseSseEvent(eventBlock);
      if (event) onEvent(event);
    }
  }

  if (buffer.trim()) {
    const event = parseSseEvent(buffer);
    if (event) onEvent(event);
  }
}

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const data = await response.json() as unknown;
    if (data && typeof data === "object" && "error" in data) {
      const error = (data as { error?: unknown }).error;
      return typeof error === "string" ? error : null;
    }
  } catch {
    return null;
  }

  return null;
}

function parseSseEvent(block: string): ChatStreamEvent | null {
  const lines = block.split("\n");
  const eventLine = lines.find((line) => line.startsWith("event:"));
  const dataLine = lines.find((line) => line.startsWith("data:"));
  if (!eventLine || !dataLine) return null;

  const type = eventLine.replace("event:", "").trim() as ChatStreamEventType;
  const data = parseJson(dataLine.replace("data:", "").trim());

  if (type === "delta") return { type, text: stringField(data, "text") };
  if (type === "status") return { type, status: stringField(data, "status") };
  if (type === "product") return { type, product: objectField<ChatProductCard>(data, "product") };
  if (type === "citation") return { type, citation: objectField<ChatCitation>(data, "citation") };
  if (type === "order") return { type, order: objectField<ChatOrderCard>(data, "order") };
  if (type === "payment") return { type, payment: objectField<ChatPaymentCard>(data, "payment") };
  if (type === "invoice") return { type, invoice: objectField<ChatInvoiceCard>(data, "invoice") };
  if (type === "error") return { type, error: stringField(data, "error") ?? "Chat failed" };
  if (type === "done") return { type };

  return null;
}

function parseJson(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function stringField(data: Record<string, unknown>, key: string): string | undefined {
  const value = data[key];
  return typeof value === "string" ? value : undefined;
}

function objectField<T>(data: Record<string, unknown>, key: string): T | undefined {
  const value = data[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value as T : undefined;
}
