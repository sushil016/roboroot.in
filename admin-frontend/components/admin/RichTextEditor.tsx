"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Link, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight 
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Enter description..." }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeStyles, setActiveStyles] = useState<string[]>([]);

  // Sync prop value to DOM innerHTML only if they diverge
  useEffect(() => {
    if (editorRef.current) {
      const currentHTML = editorRef.current.innerHTML;
      const targetHTML = value || "";
      if (isFirstMount.current || currentHTML !== targetHTML) {
        editorRef.current.innerHTML = targetHTML;
        isFirstMount.current = false;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      checkActiveStyles();
    }
  };

  const executeCommand = (command: string, arg: string = "") => {
    document.execCommand(command, false, arg);
    handleInput();
  };

  const checkActiveStyles = () => {
    const styles: string[] = [];
    if (document.queryCommandState("bold")) styles.push("bold");
    if (document.queryCommandState("italic")) styles.push("italic");
    if (document.queryCommandState("underline")) styles.push("underline");
    if (document.queryCommandState("insertUnorderedList")) styles.push("ul");
    if (document.queryCommandState("insertOrderedList")) styles.push("ol");
    
    // Check heading
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let parentNode = selection.getRangeAt(0).startContainer.parentNode as HTMLElement | null;
      while (parentNode && parentNode !== editorRef.current) {
        if (["H1", "H2", "H3"].includes(parentNode.tagName)) {
          styles.push(parentNode.tagName.toLowerCase());
          break;
        }
        parentNode = parentNode.parentNode as HTMLElement | null;
      }
    }
    setActiveStyles(styles);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Standard contenteditable handles HTML paste naturally and preserves styles (bold, italic, tags).
    // Just trigger standard update on paste.
    setTimeout(handleInput, 10);
  };

  return (
    <div 
      className={`flex flex-col border border-zinc-200 bg-white shadow-sm transition-all duration-300 ${
        isFullscreen 
          ? "fixed inset-0 z-50 p-6 bg-zinc-50/95 backdrop-blur-md" 
          : "rounded-xl overflow-hidden focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-900/5"
      }`}
    >
      {/* Editor Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-zinc-150 bg-zinc-50 p-2.5">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formats */}
          <button
            type="button"
            onClick={() => executeCommand("bold")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all ${
              activeStyles.includes("bold") 
                ? "bg-[#222222] text-white shadow-sm font-bold animate-pulse" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            }`}
            title="Bold"
          >
            <Bold className="size-4" />
          </button>
          
          <button
            type="button"
            onClick={() => executeCommand("italic")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all ${
              activeStyles.includes("italic") 
                ? "bg-[#222222] text-white shadow-sm font-bold animate-pulse" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            }`}
            title="Italic"
          >
            <Italic className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand("underline")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all ${
              activeStyles.includes("underline") 
                ? "bg-[#222222] text-white shadow-sm font-bold animate-pulse" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            }`}
            title="Underline"
          >
            <Underline className="size-4" />
          </button>

          <div className="h-5 w-px bg-zinc-200 mx-1" />

          {/* Heading levels */}
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", activeStyles.includes("h1") ? "<p>" : "<h1>")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all ${
              activeStyles.includes("h1") 
                ? "bg-[#222222] text-white shadow-sm font-bold animate-pulse" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            }`}
            title="Large Heading (H1)"
          >
            <Heading1 className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand("formatBlock", activeStyles.includes("h2") ? "<p>" : "<h2>")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all ${
              activeStyles.includes("h2") 
                ? "bg-[#222222] text-white shadow-sm font-bold animate-pulse" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            }`}
            title="Medium Heading (H2)"
          >
            <Heading2 className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand("formatBlock", activeStyles.includes("h3") ? "<p>" : "<h3>")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all ${
              activeStyles.includes("h3") 
                ? "bg-[#222222] text-white shadow-sm font-bold animate-pulse" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            }`}
            title="Small Heading (H3)"
          >
            <Heading3 className="size-4" />
          </button>

          <div className="h-5 w-px bg-zinc-200 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => executeCommand("insertUnorderedList")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all ${
              activeStyles.includes("ul") 
                ? "bg-[#222222] text-white shadow-sm font-bold animate-pulse" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            }`}
            title="Bullet List"
          >
            <List className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand("insertOrderedList")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all ${
              activeStyles.includes("ol") 
                ? "bg-[#222222] text-white shadow-sm font-bold animate-pulse" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="size-4" />
          </button>

          <div className="h-5 w-px bg-zinc-200 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => executeCommand("justifyLeft")}
            className="flex size-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            title="Align Left"
          >
            <AlignLeft className="size-4" />
          </button>
          
          <button
            type="button"
            onClick={() => executeCommand("justifyCenter")}
            className="flex size-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            title="Align Center"
          >
            <AlignCenter className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand("justifyRight")}
            className="flex size-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            title="Align Right"
          >
            <AlignRight className="size-4" />
          </button>

          <div className="h-5 w-px bg-zinc-200 mx-1" />

          {/* Links & Cleanup */}
          <button
            type="button"
            onClick={() => {
              const url = prompt("Enter link URL (e.g. https://google.com):");
              if (url !== null) executeCommand("createLink", url);
            }}
            className="flex size-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            title="Insert Link"
          >
            <Link className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand("removeFormat")}
            className="flex size-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 active:scale-95"
            title="Clear Formatting"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200 hover:text-zinc-950 active:scale-95"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Edit"}
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div 
        className={`relative flex-1 ${isFullscreen ? "h-[calc(100vh-140px)] overflow-hidden" : ""}`}
      >
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onSelect={checkActiveStyles}
          onPaste={handlePaste}
          className={`w-full overflow-y-auto p-4 outline-none text-[#222222] bg-white text-sm focus:outline-none min-h-[220px] [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_a]:text-blue-600 [&_a]:underline [&_p]:my-1.5 ${
            isFullscreen ? "h-full max-h-full" : "max-h-[380px]"
          }`}
          style={{ 
            fontFamily: "inherit",
          }}
        />
        {!value && (
          <div className="pointer-events-none absolute left-4 top-4 text-sm text-zinc-400 select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
