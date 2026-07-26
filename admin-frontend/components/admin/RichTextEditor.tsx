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
  Link as LinkIcon, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Eye,
  Edit3
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter description and technical details...",
  minHeight = "220px"
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [activeStyles, setActiveStyles] = useState<string[]>([]);

  // Sync prop value to DOM innerHTML only if they diverge
  useEffect(() => {
    if (editorRef.current && activeTab === "edit") {
      const currentHTML = editorRef.current.innerHTML;
      const targetHTML = value || "";
      if (isFirstMount.current || (currentHTML !== targetHTML && document.activeElement !== editorRef.current)) {
        editorRef.current.innerHTML = targetHTML;
        isFirstMount.current = false;
      }
    }
  }, [value, activeTab]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      checkActiveStyles();
    }
  };

  const executeCommand = (command: string, arg: string = "") => {
    if (activeTab !== "edit") setActiveTab("edit");
    
    // Focus editor first
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
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
    if (document.queryCommandState("justifyLeft")) styles.push("alignLeft");
    if (document.queryCommandState("justifyCenter")) styles.push("alignCenter");
    if (document.queryCommandState("justifyRight")) styles.push("alignRight");

    // Check heading
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let parentNode = selection.getRangeAt(0).startContainer.parentNode as HTMLElement | null;
      while (parentNode && parentNode !== editorRef.current) {
        if (["H1", "H2", "H3"].includes(parentNode?.tagName || "")) {
          styles.push(parentNode!.tagName.toLowerCase());
          break;
        }
        parentNode = parentNode?.parentNode as HTMLElement | null;
      }
    }
    setActiveStyles(styles);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    setTimeout(handleInput, 10);
  };

  return (
    <div 
      className={`flex flex-col border border-zinc-200 bg-white shadow-xs transition-all duration-300 ${
        isFullscreen 
          ? "fixed inset-0 z-50 p-6 bg-zinc-50/95 backdrop-blur-md" 
          : "rounded-2xl overflow-hidden focus-within:border-[#1CA2D1] focus-within:ring-2 focus-within:ring-[#1CA2D1]/10"
      }`}
    >
      {/* Editor Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50/80 p-2.5">
        <div className="flex flex-wrap items-center gap-1">
          
          {/* Bold, Italic, Underline */}
          <button
            type="button"
            onClick={() => executeCommand("bold")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all cursor-pointer ${
              activeStyles.includes("bold") 
                ? "bg-[#222222] text-white shadow-xs font-bold" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="size-4" />
          </button>
          
          <button
            type="button"
            onClick={() => executeCommand("italic")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all cursor-pointer ${
              activeStyles.includes("italic") 
                ? "bg-[#222222] text-white shadow-xs font-bold" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand("underline")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all cursor-pointer ${
              activeStyles.includes("underline") 
                ? "bg-[#222222] text-white shadow-xs font-bold" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="size-4" />
          </button>

          <div className="h-5 w-px bg-zinc-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", activeStyles.includes("h1") ? "<p>" : "<h1>")}
            className={`flex h-8 px-2.5 items-center justify-center gap-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeStyles.includes("h1") 
                ? "bg-[#222222] text-white shadow-xs" 
                : "text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100"
            }`}
            title="Heading 1 (Large Title)"
          >
            <Heading1 className="size-3.5" />
            <span>H1</span>
          </button>

          <button
            type="button"
            onClick={() => executeCommand("formatBlock", activeStyles.includes("h2") ? "<p>" : "<h2>")}
            className={`flex h-8 px-2.5 items-center justify-center gap-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStyles.includes("h2") 
                ? "bg-[#222222] text-white shadow-xs" 
                : "text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100"
            }`}
            title="Heading 2 (Medium Title)"
          >
            <Heading2 className="size-3.5" />
            <span>H2</span>
          </button>

          <button
            type="button"
            onClick={() => executeCommand("formatBlock", activeStyles.includes("h3") ? "<p>" : "<h3>")}
            className={`flex h-8 px-2.5 items-center justify-center gap-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStyles.includes("h3") 
                ? "bg-[#222222] text-white shadow-xs" 
                : "text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100"
            }`}
            title="Heading 3 (Small Subheading)"
          >
            <Heading3 className="size-3.5" />
            <span>H3</span>
          </button>

          <div className="h-5 w-px bg-zinc-300 mx-1" />

          {/* Bullet Points & Numbering */}
          <button
            type="button"
            onClick={() => executeCommand("insertUnorderedList")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all cursor-pointer ${
              activeStyles.includes("ul") 
                ? "bg-[#222222] text-white shadow-xs font-bold" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title="Bullet Points"
          >
            <List className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand("insertOrderedList")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all cursor-pointer ${
              activeStyles.includes("ol") 
                ? "bg-[#222222] text-white shadow-xs font-bold" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="size-4" />
          </button>

          <div className="h-5 w-px bg-zinc-300 mx-1" />

          {/* Line Alignment */}
          <button
            type="button"
            onClick={() => executeCommand("justifyLeft")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all cursor-pointer ${
              activeStyles.includes("alignLeft") 
                ? "bg-[#222222] text-white shadow-xs" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title="Align Left"
          >
            <AlignLeft className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand("justifyCenter")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all cursor-pointer ${
              activeStyles.includes("alignCenter") 
                ? "bg-[#222222] text-white shadow-xs" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title="Align Center"
          >
            <AlignCenter className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand("justifyRight")}
            className={`flex size-8 items-center justify-center rounded-lg transition-all cursor-pointer ${
              activeStyles.includes("alignRight") 
                ? "bg-[#222222] text-white shadow-xs" 
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title="Align Right"
          >
            <AlignRight className="size-4" />
          </button>

          <div className="h-5 w-px bg-zinc-300 mx-1" />

          {/* Links & Clear */}
          <button
            type="button"
            onClick={() => {
              const url = prompt("Enter website link URL:");
              if (url) executeCommand("createLink", url);
            }}
            className="flex size-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 cursor-pointer"
            title="Insert Link"
          >
            <LinkIcon className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand("removeFormat")}
            className="flex size-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
            title="Clear Formatting"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        {/* Right side controls: Edit vs Preview Mode & Fullscreen */}
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-200/80 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                activeTab === "edit" ? "bg-white text-[#222222] shadow-2xs" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Edit3 className="size-3" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                activeTab === "preview" ? "bg-[#1CA2D1] text-white shadow-2xs" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Eye className="size-3" />
              <span>Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200 hover:text-zinc-950 cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {activeTab === "edit" ? (
        <div 
          className={`relative flex-1 ${isFullscreen ? "h-[calc(100vh-140px)] overflow-hidden" : ""}`}
        >
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onSelect={checkActiveStyles}
            onPaste={handlePaste}
            className={`w-full overflow-y-auto p-4 outline-none text-[#222222] bg-white text-sm focus:outline-none 
              [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-[#222222] [&_h1]:mt-4 [&_h1]:mb-2 
              [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-[#222222] [&_h2]:mt-3 [&_h2]:mb-2 
              [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#222222] [&_h3]:mt-2 [&_h3]:mb-1 
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 
              [&_li]:my-1
              [&_a]:text-[#1CA2D1] [&_a]:underline 
              [&_p]:my-1.5 [&_p]:leading-relaxed
              ${isFullscreen ? "h-full max-h-full" : ""}`}
            style={{ 
              minHeight,
              fontFamily: "inherit",
            }}
          />
          {!value && (
            <div className="pointer-events-none absolute left-4 top-4 text-sm text-zinc-400 select-none">
              {placeholder}
            </div>
          )}
        </div>
      ) : (
        /* Live Storefront Preview Tab */
        <div 
          className={`p-6 bg-zinc-50/70 border-t border-zinc-100 overflow-y-auto ${
            isFullscreen ? "h-[calc(100vh-140px)]" : ""
          }`}
          style={{ minHeight }}
        >
          <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-3 border-b border-zinc-200 pb-2">
            Storefront Live Preview
          </div>
          {value ? (
            <div 
              className="text-sm leading-relaxed text-zinc-800 font-normal space-y-2
                [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-[#222222] [&_h1]:my-3
                [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-[#222222] [&_h2]:my-2.5
                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#222222] [&_h3]:my-2
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
                [&_li]:my-1
                [&_p]:my-2 [&_p]:leading-relaxed
                [&_a]:text-[#1CA2D1] [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ) : (
            <p className="text-sm text-zinc-400 italic">No description entered to preview.</p>
          )}
        </div>
      )}
    </div>
  );
}
