"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Grip,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  WifiOff,
  X,
  Trash2,
  History,
  Bot,
  Plus,
  MessageSquare,
  Sparkles,
  Home,
  ChevronLeft,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import { useChatStream } from "../hooks/useChatStream";
import { InputBar } from "./InputBar";
import { MessageList } from "./MessageList";
import { QuickReplies } from "./QuickReplies";
import { ProductCompareBar } from "./ProductCompareBar";
import { MagicCard } from "@/components/ui/magic-card";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { BotMessageSquare } from "@/components/animate-ui/icons/bot-message-square";

interface ChatPanelSize {
  width: number;
  height: number;
}

interface ChatPanelOffset {
  x: number;
  y: number;
}

const DEFAULT_PANEL_SIZE: ChatPanelSize = { width: 420, height: 620 };
const MIN_SIZE: ChatPanelSize = { width: 300, height: 400 };

export type WidgetMode = "fab" | "pill" | "panel" | "fullscreen";

// Synthesize pure chord chime using Web Audio API (E5 and B5 chord)
function playChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const now = ctx.currentTime;
    
    // E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    
    // B5 (987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(987.77, now);
    
    // Soft robotic chord volume envelopes
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.05, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.error("Failed to play synthesized chime", e);
  }
}

export function ChatWidget() {
  const [widgetMode, setWidgetMode] = useState<WidgetMode>("fab");
  const [panelSize, setPanelSize] = useState<ChatPanelSize>(DEFAULT_PANEL_SIZE);
  const [position, setPosition] = useState<ChatPanelOffset>({ x: 0, y: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "messages">("home");

  const {
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
  } = useChatStream();

  useEffect(() => {
    if (widgetMode === "panel" || widgetMode === "fullscreen") {
      setActiveTab(messages.length > 0 ? "messages" : "home");
    }
  }, [widgetMode, messages.length]);

  const prevMsgLength = useRef(messages.length);
  const hasLoadedRef = useRef(false);

  // Sync state from local storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPos = window.localStorage.getItem("robo-chat-panel-position");
    const savedSize = window.localStorage.getItem("robo-chat-panel-size");
    const savedMode = window.localStorage.getItem("robo-chat-widget-mode") as WidgetMode | null;
    const savedSound = window.localStorage.getItem("robo-chat-sound-enabled");

    if (savedSize) {
      try {
        setPanelSize(JSON.parse(savedSize) as ChatPanelSize);
      } catch {}
    }
    if (savedPos) {
      try {
        setPosition(JSON.parse(savedPos) as ChatPanelOffset);
      } catch {}
    } else {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setPosition({ x: w - DEFAULT_PANEL_SIZE.width - 16, y: h - DEFAULT_PANEL_SIZE.height - 16 });
    }
    if (savedMode && ["fab", "pill", "panel", "fullscreen"].includes(savedMode)) {
      setWidgetMode(savedMode);
    }
    if (savedSound) {
      setSoundEnabled(savedSound === "true");
    }
    hasLoadedRef.current = true;
  }, []);

  // Save states back to local storage when changed
  useEffect(() => {
    if (typeof window === "undefined" || !hasLoadedRef.current) return;
    window.localStorage.setItem("robo-chat-widget-mode", widgetMode);
  }, [widgetMode]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasLoadedRef.current) return;
    window.localStorage.setItem("robo-chat-sound-enabled", String(soundEnabled));
  }, [soundEnabled]);

  // Audio synthesize chime + unread alerts
  useEffect(() => {
    if (messages.length > prevMsgLength.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === "assistant" && lastMsg.content) {
        if (soundEnabled) {
          playChime();
        }
        if (widgetMode === "fab" || widgetMode === "pill") {
          setUnreadCount((c) => c + 1);
        }
      }
    }
    prevMsgLength.current = messages.length;
  }, [messages, soundEnabled, widgetMode]);

  // Clear unread count when opening chat fully
  useEffect(() => {
    if (widgetMode === "panel" || widgetMode === "fullscreen") {
      setUnreadCount(0);
    }
  }, [widgetMode]);

  // Escape key exits fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && widgetMode === "fullscreen") {
        setWidgetMode("panel");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [widgetMode]);

  const snapToClosestEdge = useCallback((currentPos: ChatPanelOffset, currentSize: ChatPanelSize) => {
    setIsSnapping(true);
    const w = window.innerWidth;
    const h = window.innerHeight;

    const distLeft = currentPos.x;
    const distRight = w - currentPos.x - currentSize.width;
    const distTop = currentPos.y;
    const distBottom = h - currentPos.y - currentSize.height;

    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    let targetX = currentPos.x;
    let targetY = currentPos.y;

    if (minDist === distLeft) {
      targetX = 16;
    } else if (minDist === distRight) {
      targetX = w - currentSize.width - 16;
    } else if (minDist === distTop) {
      targetY = 16;
    } else if (minDist === distBottom) {
      targetY = h - currentSize.height - 16;
    }

    // Keep fully inside viewport with padding
    targetX = Math.max(16, Math.min(targetX, w - currentSize.width - 16));
    targetY = Math.max(16, Math.min(targetY, h - currentSize.height - 16));

    const finalPos = { x: targetX, y: targetY };
    setPosition(finalPos);
    window.localStorage.setItem("robo-chat-panel-position", JSON.stringify(finalPos));

    setTimeout(() => {
      setIsSnapping(false);
    }, 300);
  }, []);

  const handleDragStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, input, textarea, a, svg")) return;

    setIsDragging(true);
    setIsSnapping(false);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = position.x;
    const initialY = position.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let nextX = initialX + dx;
      let nextY = initialY + dy;

      const maxLimitX = window.innerWidth - panelSize.width;
      const maxLimitY = window.innerHeight - panelSize.height;

      nextX = Math.max(0, Math.min(nextX, maxLimitX));
      nextY = Math.max(0, Math.min(nextY, maxLimitY));

      setPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      snapToClosestEdge(position, panelSize);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }, [position, panelSize, snapToClosestEdge]);

  const handleResizeStart = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSnapping(false);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = panelSize.width;
    const startHeight = panelSize.height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const newWidth = Math.max(MIN_SIZE.width, Math.min(startWidth + dx, 700));
      const newHeight = Math.max(MIN_SIZE.height, Math.min(startHeight + dy, window.innerHeight * 0.85));

      setPanelSize({ width: newWidth, height: newHeight });
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.localStorage.setItem("robo-chat-panel-size", JSON.stringify(panelSize));
      snapToClosestEdge(position, panelSize);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }, [panelSize, position, snapToClosestEdge]);

  if (!env.chatEnabled) return null;

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant" && m.content);

  // Render Closed Circular Button (FAB)
  if (widgetMode === "fab") {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <MagicCard
          className="rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] cursor-pointer"
          gradientColor="rgba(28, 162, 209, 0.2)"
          gradientFrom="#1CA2D1"
          gradientTo="#3b6bff"
          gradientSize={150}
        >
          <button
            type="button"
            onClick={() => setWidgetMode("panel")}
            className="group relative flex h-14 items-center gap-3.5 rounded-full bg-[url(/background-section1.png)] bg-cover bg-center px-6 text-white font-sans overflow-hidden border border-white/10"
            aria-label="Open RoboRoot AI Chat"
          >
            {/* Soft dark overlay to ensure readability */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />

            {/* Left Translucent Circle with Icon */}
            <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <AnimateIcon animateOnHover>
                <BotMessageSquare size={18} className="text-white" />
              </AnimateIcon>
            </div>

            {/* Content: CHAT WITH + Logo */}
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-sm font-black uppercase tracking-wider text-white">
                Chat with
              </span>
              <Image
                src="/roboroot-logo.png"
                alt="RoboRoot"
                width={95}
                height={26}
                className="h-6 w-auto object-contain brightness-0 invert"
                priority
              />
            </div>

            {/* Unread Alert Badge */}
            {unreadCount > 0 && (
              <span className="relative z-10 flex size-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </MagicCard>
      </div>
    );
  }


  // Render Minimized Horizontal Pill (Pill)
  if (widgetMode === "pill") {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[300px] rounded-full border border-border bg-card p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-300 font-sans">
        <div className="flex items-center gap-2">
          {/* Clickable Area to Expand */}
          <div
            onClick={() => setWidgetMode("panel")}
            className="flex flex-1 min-w-0 items-center gap-2.5 pl-2"
          >
            <div className="relative shrink-0 flex size-8 items-center justify-center rounded-full bg-[#1CA2D1]/15 border border-border">
              <Bot className="size-4 text-[#1CA2D1]" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[10px] font-black tracking-wider text-[#1CA2D1] uppercase">RoboRoot AI</p>
              <p className="truncate text-xs font-semibold text-foreground/80">
                {lastAssistantMsg ? lastAssistantMsg.content : "Ask me anything..."}
              </p>
            </div>
          </div>

          {/* Close FAB Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setWidgetMode("fab");
            }}
            className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition"
            aria-label="Close widget"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    );
  }

  const isFullscreen = widgetMode === "fullscreen";

  return (
    <>
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-300 animate-in fade-in cursor-pointer"
          onClick={() => setWidgetMode("panel")}
        />
      )}
      <section
        className={cn(
          "z-50 flex flex-col bg-white text-zinc-900 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.12),_0_0_1px_rgba(0,0,0,0.06)] font-sans transition-all duration-300",
          isFullscreen
            ? "fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[700px] h-screen border-l border-r border-zinc-200/80"
            : "fixed border border-zinc-150 rounded-[28px] overflow-hidden"
        )}
        style={
          isFullscreen
            ? undefined
            : {
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${panelSize.width}px`,
                height: `${panelSize.height}px`,
                transition: isSnapping ? "all 300ms cubic-bezier(0.16, 1, 0.3, 1)" : "none",
              }
        }
        aria-label="RoboRoot AI chat"
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden relative bg-white">
          {/* Sliding History Overlay Drawer */}
          {historyOpen && (
            <>
              {/* Backdrop Blur */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-xs z-30"
                onClick={() => setHistoryOpen(false)}
              />
              {/* Drawer Panel */}
              <div className="absolute inset-y-0 left-0 w-64 bg-white border-r border-zinc-200 z-40 flex flex-col p-4 shadow-2xl animate-in slide-in-from-left duration-200 text-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <h3 className="text-sm font-black flex items-center gap-1.5 uppercase tracking-wider text-[#1CA2D1]">
                    <History className="size-4" /> History
                  </h3>
                  <button
                    type="button"
                    onClick={() => setHistoryOpen(false)}
                    className="rounded-md p-1 hover:bg-zinc-100"
                  >
                    <X className="size-4 text-zinc-400 hover:text-zinc-600" />
                  </button>
                </div>

                {/* Start New Chat Button */}
                <button
                  type="button"
                  onClick={() => {
                    startNewSession();
                    setHistoryOpen(false);
                    setActiveTab("messages");
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1CA2D1] py-2.5 text-xs font-bold text-white hover:bg-[#1CA2D1]/90 transition cursor-pointer"
                >
                  <Plus className="size-3.5" /> New Chat
                </button>

                {/* Sessions List */}
                <div className="mt-4 flex-1 space-y-1 overflow-y-auto min-h-0 pr-1">
                  {sessions.map((session) => {
                    const isActive = session.id === currentSessionId;
                    return (
                      <div
                        key={session.id}
                        className={cn(
                          "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition hover:bg-zinc-50 border",
                          isActive ? "bg-zinc-100 border-zinc-200" : "border-transparent"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            loadSession(session.id);
                            setHistoryOpen(false);
                            setActiveTab("messages");
                          }}
                          className="flex-1 min-w-0 pr-6 text-left"
                        >
                          <p className={cn("truncate", isActive ? "text-[#1CA2D1] font-bold" : "text-zinc-700")}>
                            {session.title}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            {session.messages.length} messages
                          </p>
                        </button>

                        {/* Delete Session Button */}
                        <button
                          type="button"
                          onClick={() => deleteSession(session.id)}
                          className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-zinc-400 rounded transition cursor-pointer"
                          aria-label="Delete session"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* HOME TAB CONTENT */}
          {activeTab === "home" && (
            <>
              {/* Dark linear gradient header mask */}
              <div className="absolute top-0 inset-x-0 h-[260px] bg-gradient-to-b from-zinc-950 via-zinc-900/95 to-transparent pointer-events-none z-0" />

              {/* Home Header Elements */}
              <div className="relative z-10 flex flex-col pt-4 px-5 shrink-0 select-none">
                <div className="flex items-center justify-between w-full">
                  {/* Left Side: Brand Identity */}
                  <div className="flex items-center">
                    <Link href="/" className="relative flex h-8 w-28 shrink-0 items-center select-none">
                      <Image
                        src="/roboroot-logo.png"
                        alt="RoboRoot Logo"
                        width={110}
                        height={30}
                        className="h-7 w-auto object-contain brightness-0 invert"
                        priority
                      />
                    </Link>
                  </div>

                  {/* Right Side: Window Control icons instead of avatars */}
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setSoundEnabled((v) => !v)}
                      className="grid size-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
                      aria-label={soundEnabled ? "Mute chimes" : "Enable chimes"}
                      title={soundEnabled ? "Mute" : "Sound on"}
                    >
                      {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setWidgetMode("pill")}
                      className="grid size-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
                      aria-label="Minimize widget"
                      title="Minimize"
                    >
                      <Minimize2 className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setWidgetMode(isFullscreen ? "panel" : "fullscreen")}
                      className="grid size-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
                      aria-label={isFullscreen ? "Shrink widget" : "Maximize widget"}
                      title={isFullscreen ? "Shrink" : "Fullscreen"}
                    >
                      {isFullscreen ? <Minimize2 className="size-4 rotate-90" /> : <Maximize2 className="size-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setWidgetMode("fab")}
                      className="grid size-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
                      aria-label="Close chat panel"
                      title="Close"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Hero Typographic Block */}
                <div className="mt-8 px-1 text-left">
                  <h1 className="text-[32px] font-black tracking-tight text-white leading-tight">
                    Hi there 👋
                  </h1>
                  {/* Styled glassmorphic pills listing active RoboRoot AI e-commerce features */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-bold text-white shadow-sm flex items-center gap-1 hover:bg-white/15 transition-colors">
                      🛍️ Order via chat
                    </span>
                    <span className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-bold text-white shadow-sm flex items-center gap-1 hover:bg-white/15 transition-colors">
                      📦 Track order
                    </span>
                    <span className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-bold text-white shadow-sm flex items-center gap-1 hover:bg-white/15 transition-colors">
                      ⚖️ Compare components
                    </span>
                    <span className="bg-[#1CA2D1]/20 backdrop-blur-md border border-[#1CA2D1]/40 px-4 py-2 rounded-full text-sm font-extrabold text-[#1CA2D1] shadow-sm flex items-center gap-1 animate-pulse">
                      ✨ All in one chat
                    </span>
                  </div>
                </div>
              </div>

              {/* Core Home Actions Area */}
              <div className="flex-1 flex flex-col justify-start relative z-10 px-6 pt-5 overflow-y-auto min-h-0 bg-transparent scrollbar-hide">
                {/* Floating Navigation Card to start a new chat */}
                <div
                  onClick={() => {
                    startNewSession();
                    setActiveTab("messages");
                  }}
                  className="w-full bg-white rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.06),_0_0_1px_rgba(0,0,0,0.1)] border border-zinc-150 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 p-5 cursor-pointer flex items-center justify-between mt-4 group select-none shrink-0"
                >
                  <div className="flex flex-col text-left">
                    <h2 className="text-base font-black text-zinc-900 group-hover:text-[#1CA2D1] transition-colors flex items-center gap-1.5 leading-none">
                      Start a new chat
                    </h2>
                    <p className="text-xs text-zinc-500 font-bold mt-2">
                      Get instant insight of all components
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-full bg-zinc-50 group-hover:bg-[#1CA2D1]/10 group-hover:text-[#1CA2D1] text-zinc-950 transition-colors shadow-inner border border-zinc-100">
                    <BotMessageSquare size={18} className="rotate-45 text-[#1CA2D1]" />
                  </div>
                </div>

                {/* Direct Recent Conversations List (No sidebar drawer needed) */}
                {sessions.length > 0 && (
                  <div className="mt-8 flex flex-col min-h-0 text-left shrink-0 pb-4">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest leading-none select-none mb-4 pl-1">
                      Recent Conversations
                    </h3>
                    <div className="space-y-2.5 overflow-y-auto max-h-[190px] pr-1 scrollbar-hide">
                      {sessions.map((session) => {
                        const isActive = session.id === currentSessionId;
                        return (
                          <div
                            key={session.id}
                            className={cn(
                              "group relative flex items-center justify-between rounded-[16px] px-4 py-3 text-left text-xs font-bold transition bg-zinc-50/60 border hover:bg-zinc-100/80 cursor-pointer",
                              isActive ? "bg-zinc-100/90 border-[#1CA2D1]/30 shadow-xs" : "border-zinc-100"
                            )}
                            onClick={() => {
                              loadSession(session.id);
                              setActiveTab("messages");
                            }}
                          >
                            <div className="flex-1 min-w-0 pr-6">
                              <p className={cn("truncate text-sm font-black", isActive ? "text-[#1CA2D1]" : "text-zinc-800")}>
                                {session.title}
                              </p>
                              <p className="text-[11px] text-zinc-400 font-bold mt-1.5">
                                {session.messages.length} message{session.messages.length === 1 ? "" : "s"} · {new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </p>
                            </div>

                            {/* Delete Session Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.id);
                              }}
                              className="p-1.5 hover:text-red-500 hover:bg-red-50 text-zinc-400 rounded-lg transition cursor-pointer"
                              aria-label="Delete session"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-8 text-center text-zinc-400 text-[10px] uppercase font-black tracking-widest leading-none select-none shrink-0 pb-4">
                  Powered by RoboRoot AI Engine
                </div>
              </div>
            </>
          )}

          {/* MESSAGES TAB CONTENT */}
          {activeTab === "messages" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Messages View White Header */}
              <div className="border-b border-zinc-100 bg-white px-4 py-3 flex items-center justify-between select-none relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                  {/* ChevronLeft arrow button to return to Home Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("home")}
                    className="grid size-8 place-items-center rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition cursor-pointer border border-zinc-100 bg-zinc-50/50"
                    aria-label="Back to home"
                    title="Back"
                  >
                    <ChevronLeft className="size-5" />
                  </button>

                  {/* Title block */}
                  <div className="flex flex-col text-left">
                    <h2 className="text-sm font-black text-zinc-900 leading-none py-1">
                      RoboRoot AI
                    </h2>
                  </div>
                </div>

                {/* Right utility toolbar */}
                <div className="flex items-center gap-0.5">

                  <button
                    type="button"
                    onClick={() => setSoundEnabled((v) => !v)}
                    className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition cursor-pointer"
                    aria-label={soundEnabled ? "Mute chimes" : "Enable chimes"}
                    title={soundEnabled ? "Mute" : "Sound on"}
                  >
                    {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                  </button>

                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition cursor-pointer"
                      aria-label="Clear session history"
                      title="Clear Chat"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setWidgetMode("pill")}
                    className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition cursor-pointer"
                    aria-label="Minimize widget"
                    title="Minimize"
                  >
                    <Minimize2 className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setWidgetMode(isFullscreen ? "panel" : "fullscreen")}
                    className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition cursor-pointer"
                    aria-label={isFullscreen ? "Shrink widget" : "Maximize widget"}
                    title={isFullscreen ? "Shrink" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 className="size-4 rotate-90" /> : <Maximize2 className="size-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setWidgetMode("fab")}
                    className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition cursor-pointer"
                    aria-label="Close chat panel"
                    title="Close"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Chat messages viewport */}
              <div className="flex-1 flex flex-col min-h-0 bg-white relative">
                {!isOnline && (
                  <div className="flex items-center justify-center gap-2 border-b border-red-100 bg-red-50/80 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-red-500 select-none shrink-0">
                    <WifiOff className="size-3.5 shrink-0" />
                    Offline · messages queue automatically
                  </div>
                )}

                <MessageList
                  messages={messages}
                  onRegenerate={regenerate}
                  onRetry={sendMessage}
                  isStreaming={isStreaming}
                />
                {messages.length === 0 ? (
                  <QuickReplies disabled={isStreaming} onSelect={sendMessage} />
                ) : null}

                <ProductCompareBar />
                
                {/* Redesigned solid black border Input Bar */}
                <InputBar
                  disabled={isStreaming}
                  isStreaming={isStreaming}
                  onSend={sendMessage}
                  onStop={stop}
                />
              </div>
            </div>
          )}

          {/* Sticky Bottom Navigation Bar across both views */}
          <div className="border-t border-zinc-100 bg-white flex items-center justify-around py-2 px-4 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] shrink-0 select-none">
            {/* Home portal tab button */}
            <button
              type="button"
              onClick={() => setActiveTab("home")}
              className={cn(
                "flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-all duration-200 cursor-pointer flex-1",
                activeTab === "home"
                  ? "text-zinc-950 font-bold scale-[1.02]"
                  : "text-zinc-400 hover:text-zinc-600 font-semibold"
              )}
            >
              <Home className={cn("size-5 transition-transform duration-200", activeTab === "home" ? "scale-105 text-zinc-950" : "")} />
              <span className="text-[10px]">Home</span>
            </button>

            {/* Messages portal tab button */}
            <button
              type="button"
              onClick={() => setActiveTab("messages")}
              className={cn(
                "flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-all duration-200 cursor-pointer flex-1",
                activeTab === "messages"
                  ? "text-zinc-950 font-bold scale-[1.02]"
                  : "text-zinc-400 hover:text-zinc-600 font-semibold"
              )}
            >
              <MessageSquare className={cn("size-5 transition-transform duration-200", activeTab === "messages" ? "scale-105 text-zinc-950" : "")} />
              <span className="text-[10px]">Messages</span>
            </button>
          </div>

          {/* Panel Resizer Handle at Bottom-Right */}
          {!isFullscreen && (
            <button
              type="button"
              className="absolute bottom-1 right-1 z-50 grid size-5 cursor-nwse-resize place-items-center rounded text-zinc-300 hover:text-zinc-600 pointer-events-auto"
              aria-label="Resize panel"
              onPointerDown={handleResizeStart}
            >
              <Grip className="size-3.5 rotate-45" />
            </button>
          )}
        </div>
      </section>
    </>
  );
}
