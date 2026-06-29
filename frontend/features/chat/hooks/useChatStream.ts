"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHAT_SESSION_KEY, CHAT_STORAGE_KEY } from "../index";
import { ChatAuthRequiredError, streamChat } from "../services/chat.service";
import type { ChatMessage, ChatStreamEvent, ChatSession } from "../types/chat.types";

const STREAM_TICK_MS = 16;
const STREAM_CHUNK_CHARS = 18;

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `chat_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function useChatStream() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const abortRef = useRef<AbortController | null>(null);
  const streamQueueRef = useRef<string[]>([]);
  const streamTimerRef = useRef<number | null>(null);
  const pendingMessageRef = useRef<string | null>(null);
  const hasLoadedRef = useRef(false);

  // Active messages derived from current session
  const messages = useMemo(() => {
    return sessions.find((s) => s.id === currentSessionId)?.messages || [];
  }, [sessions, currentSessionId]);

  const clearStreamAnimation = useCallback(() => {
    streamQueueRef.current = [];
    if (streamTimerRef.current) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
  }, []);

  // Update messages wrapper that updates the current session in the list
  const setMessages = useCallback(
    (updater: ChatMessage[] | ((current: ChatMessage[]) => ChatMessage[])) => {
      setSessions((prevSessions) => {
        return prevSessions.map((session) => {
          if (session.id !== currentSessionId) return session;

          const newMessages = typeof updater === "function" ? updater(session.messages) : updater;

          // Update title dynamically if it was "New Chat" and we now have a user message
          let newTitle = session.title;
          if (session.title === "New Chat" || session.title === "Previous Chat") {
            const firstUserMsg = newMessages.find((m) => m.role === "user");
            if (firstUserMsg) {
              const content = firstUserMsg.content;
              newTitle = content.length > 35 ? content.slice(0, 35) + "..." : content;
            }
          }

          return {
            ...session,
            title: newTitle,
            messages: newMessages,
          };
        });
      });
    },
    [currentSessionId],
  );

  const pumpStreamQueue = useCallback(
    (assistantId: string) => {
      if (streamTimerRef.current) return;

      streamTimerRef.current = window.setInterval(() => {
        const next = streamQueueRef.current.shift();
        if (!next) {
          if (streamTimerRef.current) {
            window.clearInterval(streamTimerRef.current);
            streamTimerRef.current = null;
          }
          setStatus((current) => (current === "writing" ? null : current));
          return;
        }

        setMessages((current) => updateAssistant(current, assistantId, { appendContent: next }));
      }, STREAM_TICK_MS);
    },
    [setMessages],
  );

  const enqueueAssistantDelta = useCallback(
    (assistantId: string, text: string) => {
      streamQueueRef.current.push(...splitStreamingText(text));
      setStatus("writing");
      pumpStreamQueue(assistantId);
    },
    [pumpStreamQueue],
  );

  const waitForStreamQueue = useCallback(async () => {
    while (streamQueueRef.current.length > 0 || streamTimerRef.current) {
      await new Promise((resolve) => window.setTimeout(resolve, STREAM_TICK_MS));
    }
  }, []);

  // Load from storage once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    let storedSessions: ChatSession[] = [];
    try {
      const raw = window.localStorage.getItem("robo-chat-sessions");
      if (raw) {
        storedSessions = JSON.parse(raw) as ChatSession[];
      }
    } catch (e) {
      console.error("Failed to parse sessions", e);
    }

    // Migration from old legacy single-session history if no sessions exist
    if (storedSessions.length === 0) {
      try {
        const legacyRaw = window.localStorage.getItem(CHAT_STORAGE_KEY);
        if (legacyRaw) {
          const legacyMessages = JSON.parse(legacyRaw) as ChatMessage[];
          if (Array.isArray(legacyMessages) && legacyMessages.length > 0) {
            const firstUser = legacyMessages.find((m) => m.role === "user")?.content || "Previous Chat";
            const legacySession: ChatSession = {
              id: window.localStorage.getItem(CHAT_SESSION_KEY) || createId(),
              title: firstUser.length > 30 ? firstUser.slice(0, 30) + "..." : firstUser,
              createdAt: legacyMessages[0]?.createdAt || new Date().toISOString(),
              messages: legacyMessages,
            };
            storedSessions = [legacySession];
          }
        }
      } catch (e) {
        // Ignore legacy migration error
      }
    }

    let activeId = window.localStorage.getItem("robo-chat-current-session-id") || "";

    if (storedSessions.length === 0) {
      const nextId = createId();
      const newSession: ChatSession = {
        id: nextId,
        title: "New Chat",
        createdAt: new Date().toISOString(),
        messages: [],
      };
      storedSessions = [newSession];
      activeId = nextId;
    } else {
      const exists = storedSessions.some((s) => s.id === activeId);
      if (!exists) {
        activeId = storedSessions[0]?.id || "";
      }
    }

    setSessions(storedSessions);
    setCurrentSessionId(activeId);
    hasLoadedRef.current = true;
  }, []);

  // Sync back to localStorage whenever sessions or activeId change
  useEffect(() => {
    if (typeof window === "undefined" || !hasLoadedRef.current) return;
    window.localStorage.setItem("robo-chat-sessions", JSON.stringify(sessions));
    window.localStorage.setItem("robo-chat-current-session-id", currentSessionId);
  }, [sessions, currentSessionId]);

  // Online / offline detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      if (pendingMessageRef.current) {
        const pending = pendingMessageRef.current;
        pendingMessageRef.current = null;
        void sendMessage(pending);
      }
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      // If offline, queue message and show friendly notice
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        pendingMessageRef.current = trimmed;
        const offlineId = createId();
        const now = new Date().toISOString();
        setMessages((current) => [
          ...current,
          {
            id: createId(),
            role: "user",
            content: trimmed,
            createdAt: now,
            products: [],
            citations: [],
            orderCards: [],
            paymentCards: [],
            invoiceCards: [],
            isOfflineQueued: true,
          },
          {
            id: offlineId,
            role: "assistant",
            content: "⚡ You appear to be offline. Your message will be sent automatically when your connection is restored.",
            createdAt: now,
            products: [],
            citations: [],
            orderCards: [],
            paymentCards: [],
            invoiceCards: [],
            isError: true,
          },
        ]);
        return;
      }

      const assistantId = createId();
      const now = new Date().toISOString();
      clearStreamAnimation();
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "user",
          content: trimmed,
          createdAt: now,
          products: [],
          citations: [],
          orderCards: [],
          paymentCards: [],
          invoiceCards: [],
        },
        {
          id: assistantId,
          role: "assistant",
          content: "",
          createdAt: now,
          products: [],
          citations: [],
          orderCards: [],
          paymentCards: [],
          invoiceCards: [],
        },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);
      setStatus("connecting");

      try {
        await streamChat({
          message: trimmed,
          sessionId: currentSessionId,
          signal: controller.signal,
          onEvent: (event) => applyStreamEvent(event, assistantId, setMessages, setStatus, enqueueAssistantDelta),
        });
        await waitForStreamQueue();
      } catch (error) {
        clearStreamAnimation();
        if (error instanceof ChatAuthRequiredError) {
          setMessages((current) =>
            updateAssistant(current, assistantId, {
              content: "Log in to use RoboRoot AI chat for orders, payments, invoices, and saved recommendations.",
              actionHref: "/login?redirect=/",
              actionLabel: "Log in to chat",
            }),
          );
        } else if (error instanceof Error && error.message.includes("429")) {
          setMessages((current) =>
            updateAssistant(current, assistantId, {
              content: "🙏 Slow down a bit — you're sending messages too fast. Please wait a moment and try again.",
              isRateLimited: true,
            }),
          );
        } else if (error instanceof Error && error.name !== "AbortError") {
          setMessages((current) =>
            updateAssistant(current, assistantId, {
              content: error.message || "Something went wrong. Please try again.",
              isError: true,
              retryContent: trimmed,
            }),
          );
        }
      } finally {
        setIsStreaming(false);
        setStatus(null);
        abortRef.current = null;
      }
    },
    [clearStreamAnimation, enqueueAssistantDelta, isStreaming, currentSessionId, waitForStreamQueue, setMessages],
  );

  const stop = useCallback(() => {
    clearStreamAnimation();
    abortRef.current?.abort();
    setIsStreaming(false);
    setStatus(null);
    setMessages((current) => {
      if (current.length === 0) return current;
      const lastMsg = current[current.length - 1];
      if (lastMsg && lastMsg.role === "assistant" && lastMsg.content === "") {
        return current.map((msg, idx) => {
          if (idx === current.length - 1) {
            return {
              ...msg,
              content: "Chat cancelled. Edit if you want.",
              isCancelled: true,
            };
          }
          return msg;
        });
      }
      return current;
    });
  }, [clearStreamAnimation, setMessages]);

  const regenerate = useCallback(() => {
    if (isStreaming) return;
    // Find last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    // Drop the last assistant message
    setMessages((current) => {
      const lastAssistantIdx = [...current].reverse().findIndex((m) => m.role === "assistant");
      if (lastAssistantIdx === -1) return current;
      const realIdx = current.length - 1 - lastAssistantIdx;
      return current.slice(0, realIdx);
    });
    // Re-send
    void sendMessage(lastUserMsg.content);
  }, [isStreaming, messages, sendMessage, setMessages]);

  const startNewSession = useCallback(() => {
    stop();
    const nextId = createId();
    const newSession: ChatSession = {
      id: nextId,
      title: "New Chat",
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev].slice(0, 20));
    setCurrentSessionId(nextId);
  }, [stop]);

  const loadSession = useCallback(
    (id: string) => {
      stop();
      setCurrentSessionId(id);
    },
    [stop],
  );

  const deleteSession = useCallback(
    (id: string) => {
      stop();
      const updated = sessions.filter((s) => s.id !== id);
      if (updated.length === 0) {
        const nextId = createId();
        const newSession: ChatSession = {
          id: nextId,
          title: "New Chat",
          createdAt: new Date().toISOString(),
          messages: [],
        };
        setSessions([newSession]);
        setCurrentSessionId(nextId);
      } else {
        setSessions(updated);
        if (currentSessionId === id) {
          setCurrentSessionId(updated[0].id);
        }
      }
    },
    [sessions, currentSessionId, stop],
  );

  const clearHistory = useCallback(() => {
    stop();
    const nextId = createId();
    const newSession: ChatSession = {
      id: nextId,
      title: "New Chat",
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setSessions([newSession]);
    setCurrentSessionId(nextId);
  }, [stop]);

  useEffect(() => clearStreamAnimation, [clearStreamAnimation]);

  return {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    isOnline,
    status,
    sendMessage,
    stop,
    regenerate,
    startNewSession,
    loadSession,
    deleteSession,
    clearHistory,
  };
}

function applyStreamEvent(
  event: ChatStreamEvent,
  assistantId: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setStatus: React.Dispatch<React.SetStateAction<string | null>>,
  enqueueAssistantDelta: (assistantId: string, text: string) => void,
): void {
  if (event.type === "status") {
    setStatus(event.status ?? null);
    return;
  }

  if (event.type === "delta" && event.text) {
    enqueueAssistantDelta(assistantId, event.text);
  }

  if (event.type === "product" && event.product) {
    setMessages((current) => updateAssistant(current, assistantId, { product: event.product }));
  }

  if (event.type === "citation" && event.citation) {
    setMessages((current) => updateAssistant(current, assistantId, { citation: event.citation }));
  }

  if (event.type === "order" && event.order) {
    setMessages((current) => updateAssistant(current, assistantId, { orderCard: event.order }));
  }

  if (event.type === "payment" && event.payment) {
    setMessages((current) => updateAssistant(current, assistantId, { paymentCard: event.payment }));
  }

  if (event.type === "invoice" && event.invoice) {
    setMessages((current) => updateAssistant(current, assistantId, { invoiceCard: event.invoice }));
  }

  if (event.type === "error") {
    setMessages((current) => updateAssistant(current, assistantId, { content: event.error ?? "Chat failed", isError: true }));
  }
}

function splitStreamingText(text: string): string[] {
  const tokens = text.match(/\s+|[^\s]+/g);
  if (!tokens) return text ? [text] : [];

  const chunks: string[] = [];
  let current = "";

  for (const token of tokens) {
    if (token.length > STREAM_CHUNK_CHARS) {
      if (current) {
        chunks.push(current);
        current = "";
      }

      for (let index = 0; index < token.length; index += STREAM_CHUNK_CHARS) {
        chunks.push(token.slice(index, index + STREAM_CHUNK_CHARS));
      }
      continue;
    }

    if (current && current.length + token.length > STREAM_CHUNK_CHARS) {
      chunks.push(current);
      current = "";
    }

    current += token;
  }

  if (current) chunks.push(current);
  return chunks;
}

function updateAssistant(
  messages: ChatMessage[],
  assistantId: string,
  patch: {
    content?: string;
    appendContent?: string;
    product?: ChatMessage["products"][number];
    citation?: ChatMessage["citations"][number];
    orderCard?: ChatMessage["orderCards"][number];
    paymentCard?: ChatMessage["paymentCards"][number];
    invoiceCard?: ChatMessage["invoiceCards"][number];
    actionHref?: string;
    actionLabel?: string;
    isError?: boolean;
    isRateLimited?: boolean;
    retryContent?: string;
  },
): ChatMessage[] {
  return messages.map((message) => {
    if (message.id !== assistantId) return message;

    return {
      ...message,
      content: patch.content ?? `${message.content}${patch.appendContent ?? ""}`,
      products: patch.product ? [...message.products, patch.product] : message.products,
      citations: patch.citation ? [...message.citations, patch.citation] : message.citations,
      orderCards: patch.orderCard ? [...message.orderCards, patch.orderCard] : message.orderCards,
      paymentCards: patch.paymentCard ? [...message.paymentCards, patch.paymentCard] : message.paymentCards,
      invoiceCards: patch.invoiceCard ? [...message.invoiceCards, patch.invoiceCard] : message.invoiceCards,
      actionHref: patch.actionHref ?? message.actionHref,
      actionLabel: patch.actionLabel ?? message.actionLabel,
      isError: patch.isError ?? message.isError,
      isRateLimited: patch.isRateLimited ?? message.isRateLimited,
      retryContent: patch.retryContent ?? message.retryContent,
    };
  });
}
