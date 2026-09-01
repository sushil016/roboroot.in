"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Send,
  Square,
  Mic,
  MicOff,
  Paperclip,
  X,
  Image as ImageIcon,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SlashCommandPopup } from "./SlashCommandPopup";

const MAX_CHARS = 600;

interface InputBarProps {
  disabled: boolean;
  isStreaming: boolean;
  onSend: (message: string) => void;
  onStop: () => void;
  inputValue?: string;
}

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function InputBar({ disabled, isStreaming, onSend, onStop, inputValue }: InputBarProps) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [showSlash, setShowSlash] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  // Listen to external input value changes (e.g. from editing a message)
  useEffect(() => {
    if (inputValue !== undefined) {
      setValue(inputValue);
      textareaRef.current?.focus();
    }
  }, [inputValue]);

  // Show slash popup when input starts with /
  useEffect(() => {
    setShowSlash(value.trimStart().startsWith("/") && value.trim().length <= 20);
  }, [value]);

  // Handle programmatic message sending
  useEffect(() => {
    const handleSendMsg = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      if (customEvent.detail?.message) {
        onSend(customEvent.detail.message);
      }
    };
    window.addEventListener("chat-send-message", handleSendMsg);
    return () => {
      window.removeEventListener("chat-send-message", handleSendMsg);
    };
  }, [onSend]);

  function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    const finalMessage = imageName
      ? `[Image: ${imageName}]\n${trimmed}`
      : trimmed;
    setValue("");
    setImagePreview(null);
    setImageName(null);
    onSend(finalMessage);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
    // Close slash popup on Escape
    if (event.key === "Escape") setShowSlash(false);
  }

  function handleSlashSelect(command: string) {
    setValue(command + " ");
    setShowSlash(false);
    textareaRef.current?.focus();
  }

  // Voice input
  const toggleVoice = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setValue((prev) => prev + (prev ? " " : "") + transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // Image upload
  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function removeImage() {
    setImagePreview(null);
    setImageName(null);
  }

  const charsLeft = MAX_CHARS - value.length;
  const isOverLimit = value.length > MAX_CHARS;

  return (
    <div className="relative bg-white font-sans px-4 pb-4 pt-1 shrink-0">
      {/* Slash command popup */}
      {showSlash && (
        <SlashCommandPopup query={value.trim()} onSelect={handleSlashSelect} />
      )}

      {/* Image upload preview */}
      {imagePreview && (
        <div className="flex items-center gap-3 px-4 pb-3 pt-1 animate-in fade-in duration-200">
          <div className="relative size-12 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 shrink-0 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Upload preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-black/80 text-white hover:bg-black cursor-pointer shadow-md"
              aria-label="Remove image"
            >
              <X className="size-2.5" />
            </button>
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
              <ImageIcon className="size-3.5 text-[var(--brand-primary)]" />
              {imageName}
            </p>
            <p className="text-[9px] text-zinc-400 font-bold uppercase mt-0.5">AI will inspect and analyze this hardware image</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full border-2 border-zinc-900 rounded-[24px] bg-white p-3 flex flex-col gap-2.5 shadow-xs hover:shadow-sm transition-shadow"
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          aria-label="Upload image"
        />

        {/* Text Area Input - Top Row */}
        <div className="relative min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Message..."
            className={cn(
              "w-full resize-none border-0 bg-white text-zinc-900 p-0 text-sm leading-6 outline-none transition placeholder-zinc-400 focus:ring-0 focus:outline-none focus:border-0",
              "disabled:opacity-50"
            )}
            style={{ maxHeight: 120 }}
          />

          {/* Character counter (clean layout) */}
          {value.length > MAX_CHARS * 0.75 && (
            <span
              className={cn(
                "absolute top-0 right-0 text-[10px] font-bold font-mono tabular-nums",
                isOverLimit ? "text-red-500" : "text-zinc-400"
              )}
            >
              {charsLeft}
            </span>
          )}
        </div>

        {/* Divider line between input text and action buttons */}
        <div className="h-[1px] bg-zinc-100/80 w-full" />

        {/* Actions Bar - Bottom Row */}
        <div className="flex items-center justify-between pt-0.5">
          {/* Left Side: Attachment, Emoji, GIF, Voice Mic */}
          <div className="flex items-center gap-1.5">
            {/* Paperclip attachment button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="grid size-8 place-items-center rounded-full text-zinc-400 hover:bg-black/5 hover:text-black transition disabled:opacity-40 cursor-pointer"
              aria-label="Attach hardware image"
              title="Attach image"
            >
              <Paperclip className="size-4" />
            </button>

            {/* Emoji Smiley face */}
            <button
              type="button"
              disabled={disabled}
              className="grid size-8 place-items-center rounded-full text-zinc-400 hover:bg-black/5 hover:text-black transition disabled:opacity-40 cursor-pointer"
              aria-label="Add emoji"
              title="Emoji"
            >
              <span className="text-zinc-400 text-base leading-none select-none">😊</span>
            </button>

            {/* Square GIF box */}
            <button
              type="button"
              disabled={disabled}
              className="grid size-8 place-items-center"
              aria-label="Add GIF"
              title="GIF"
            >
              <span className="text-[9px] font-black tracking-wider uppercase bg-white text-zinc-500 hover:bg-black/5 hover:text-black border border-zinc-200 rounded px-1.5 py-0.5 leading-none transition select-none">
                GIF
              </span>
            </button>

            {/* Microphone Voice speech input */}
            <button
              type="button"
              onClick={toggleVoice}
              disabled={disabled}
              className={cn(
                "grid size-8 place-items-center rounded-full transition disabled:opacity-40 cursor-pointer",
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-zinc-400 hover:bg-black/5 hover:text-black",
              )}
              aria-label={isListening ? "Stop speech" : "Speech to text"}
              title={isListening ? "Stop listening" : "Speech to text"}
            >
              {isListening ? <MicOff className="size-4 text-white" /> : <Mic className="size-4" />}
            </button>
          </div>

          {/* Right Side: Circular send/stop action button */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="grid size-8 place-items-center rounded-full bg-black text-white hover:bg-black/90 hover:scale-105 transition cursor-pointer shadow-xs shrink-0"
              aria-label="Stop generation"
              title="Stop generation"
            >
              <Square className="size-3 fill-white text-white" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={disabled || !value.trim() || isOverLimit}
              className={cn(
                "grid size-8 place-items-center rounded-full transition shadow-xs shrink-0",
                value.trim() && !isOverLimit
                  ? "bg-black text-white hover:bg-black/90 hover:scale-105 cursor-pointer"
                  : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              )}
              aria-label="Send message"
              title="Send"
            >
              <ArrowUp className="size-4 stroke-[3]" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
