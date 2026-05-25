"use client";

import { useState } from "react";
import type React from "react";
import { Check, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageContentProps {
  content: string;
}

type ContentBlock =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; items: string[]; ordered: boolean }
  | { type: "steps"; items: string[] }
  | { type: "code"; language: string; code: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "heading"; level: 1 | 2 | 3; text: string };

const COLLAPSE_LINE_THRESHOLD = 8;

export function MessageContent({ content }: MessageContentProps) {
  const blocks = parseContent(content);

  return (
    <div className="space-y-3 font-sans text-sm leading-6 text-foreground/90">
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return <CodeBlock key={`code-${index}`} language={block.language} code={block.code} />;
        }
        if (block.type === "table") {
          return <TableBlock key={`table-${index}`} headers={block.headers} rows={block.rows} />;
        }
        if (block.type === "list") {
          return (
            <CollapsibleBlock key={`list-${index}`} lineCount={block.items.length}>
              {block.ordered ? (
                <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground">
                  {block.items.map((item, itemIndex) => (
                    <li key={`${item}-${itemIndex}`} className="pl-1 leading-6">{renderInline(item)}</li>
                  ))}
                </ol>
              ) : (
                <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
                  {block.items.map((item, itemIndex) => (
                    <li key={`${item}-${itemIndex}`} className="pl-1 leading-6">{renderInline(item)}</li>
                  ))}
                </ul>
              )}
            </CollapsibleBlock>
          );
        }
        if (block.type === "steps") {
          return (
            <CollapsibleBlock key={`steps-${index}`} lineCount={block.items.length}>
              <ol className="space-y-3.5">
                {block.items.map((item, stepIndex) => (
                  <li key={`step-${stepIndex}`} className="flex items-start gap-3">
                    <span className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-[#1CA2D1] text-[10px] font-bold text-white mt-0.5 font-mono shadow-[0_0_8px_rgba(28,162,209,0.4)]">
                      {stepIndex + 1}
                    </span>
                    <span className="flex-1 leading-6 text-foreground/90">{renderInline(item)}</span>
                  </li>
                ))}
              </ol>
            </CollapsibleBlock>
          );
        }
        if (block.type === "heading") {
          const Tag = block.level === 1 ? "h3" : block.level === 2 ? "h4" : "p";
          return (
            <Tag
              key={`heading-${index}`}
              className={cn(
                "font-bold text-foreground tracking-wide mt-2",
                block.level === 1 && "text-base",
                block.level === 2 && "text-sm",
                block.level === 3 && "text-sm text-muted-foreground",
              )}
            >
              {renderInline(block.text)}
            </Tag>
          );
        }
        return (
          <CollapsibleBlock key={`paragraph-${index}`} lineCount={block.lines.length}>
            <p className="whitespace-pre-wrap leading-6 text-foreground/90">
              {renderInline(block.lines.join("\n"))}
            </p>
          </CollapsibleBlock>
        );
      })}
    </div>
  );
}

// Collapsible wrapper — collapses long blocks after COLLAPSE_LINE_THRESHOLD lines
function CollapsibleBlock({ children, lineCount }: { children: React.ReactNode; lineCount: number }) {
  const [expanded, setExpanded] = useState(false);
  const needsCollapse = lineCount > COLLAPSE_LINE_THRESHOLD;

  if (!needsCollapse) return <>{children}</>;

  return (
    <div>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          expanded ? "max-h-[2000px]" : "max-h-32",
        )}
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1CA2D1] hover:text-[#1CA2D1]/85 uppercase tracking-wider cursor-pointer"
      >
        {expanded ? (
          <>
            <ChevronUp className="size-3" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="size-3" />
            Show more
          </>
        )}
      </button>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/40 text-foreground">
      <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1 shrink-0">
            <span className="size-2 rounded-full bg-[#ff5f56]" />
            <span className="size-2 rounded-full bg-[#ffbd2e]" />
            <span className="size-2 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground font-mono pl-1">
            {language || "code"}
          </span>
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
          aria-label="Copy code snippet"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-6 font-mono text-foreground/90 font-medium bg-[#0f1219] dark:bg-black/30">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-md">
      <table className="min-w-full border-collapse text-left text-xs font-sans">
        <thead className="bg-muted text-foreground border-b border-border">
          <tr>
            {headers.map((header, index) => (
              <th key={`${header}-${index}`} className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                {renderInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {rows.map((row, rowIndex) => (
            <tr
              key={`row-${rowIndex}`}
              className={cn("transition-colors", rowIndex % 2 === 1 ? "bg-background/40" : "bg-card")}
            >
              {headers.map((_, cellIndex) => (
                <td key={`cell-${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top text-foreground/90 font-medium leading-5">
                  {renderInline(row[cellIndex] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function parseContent(content: string): ContentBlock[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ContentBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim()) {
      index += 1;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = (Math.min(headingMatch[1]?.length ?? 1, 3)) as 1 | 2 | 3;
      blocks.push({ type: "heading", level, text: headingMatch[2] ?? "" });
      index += 1;
      continue;
    }

    // Code blocks
    if (line.trimStart().startsWith("```")) {
      const language = line.trim().replace(/^```/, "").trim();
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? "").trimStart().startsWith("```")) {
        codeLines.push(lines[index] ?? "");
        index += 1;
      }
      index += 1;
      blocks.push({ type: "code", language, code: codeLines.join("\n") });
      continue;
    }

    // Tables
    if (isTableStart(lines, index)) {
      const headers = splitTableRow(lines[index] ?? "");
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && isTableRow(lines[index] ?? "")) {
        rows.push(splitTableRow(lines[index] ?? ""));
        index += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // Numbered step lists (1. 2. 3. — detect as "steps" if numbers are sequential from 1)
    if (isNumberedStepLine(line, 1)) {
      const items: string[] = [];
      let expected = 1;
      while (index < lines.length && isNumberedStepLine(lines[index] ?? "", expected)) {
        items.push((lines[index] ?? "").replace(/^\s*\d+\.\s+/, ""));
        index += 1;
        expected += 1;
      }
      // If >= 2 sequential items, treat as steps; else ordered list
      blocks.push(items.length >= 2 ? { type: "steps", items } : { type: "list", items, ordered: true });
      continue;
    }

    // Ordered lists (any numbered)
    if (isOrderedListLine(line)) {
      const items: string[] = [];
      while (index < lines.length && isOrderedListLine(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", items, ordered: true });
      continue;
    }

    // Unordered lists
    if (isListLine(line)) {
      const items: string[] = [];
      while (index < lines.length && isListLine(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", items, ordered: false });
      continue;
    }

    // Paragraphs
    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      (lines[index] ?? "").trim() &&
      !(lines[index] ?? "").trimStart().startsWith("```") &&
      !isTableStart(lines, index) &&
      !isListLine(lines[index] ?? "") &&
      !isOrderedListLine(lines[index] ?? "") &&
      !/^#{1,3}\s+/.test(lines[index] ?? "")
    ) {
      paragraphLines.push(lines[index] ?? "");
      index += 1;
    }
    if (paragraphLines.length > 0) {
      blocks.push({ type: "paragraph", lines: paragraphLines });
    }
  }

  return blocks;
}

function renderInline(text: string): React.ReactNode {
  // Split on bold, italic, and inline code patterns
  const pieces = text.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g);

  return pieces.map((piece, index) => {
    if ((piece.startsWith("**") && piece.endsWith("**")) || (piece.startsWith("__") && piece.endsWith("__"))) {
      return <strong key={`b-${index}`} className="font-bold text-foreground">{piece.slice(2, -2)}</strong>;
    }
    if ((piece.startsWith("*") && piece.endsWith("*") && !piece.startsWith("**")) ||
        (piece.startsWith("_") && piece.endsWith("_") && !piece.startsWith("__"))) {
      return <em key={`i-${index}`} className="text-foreground/80">{piece.slice(1, -1)}</em>;
    }
    if (piece.startsWith("`") && piece.endsWith("`") && piece.length > 1) {
      return (
        <code key={`c-${index}`} className="rounded bg-muted border border-border px-1.5 py-0.5 text-[0.9em] font-mono text-[#1CA2D1] font-semibold">
          {piece.slice(1, -1)}
        </code>
      );
    }
    return <span key={`t-${index}`}>{piece}</span>;
  });
}

function isListLine(line: string): boolean {
  return /^\s*[-*]\s+\S/.test(line);
}

function isOrderedListLine(line: string): boolean {
  return /^\s*\d+\.\s+\S/.test(line);
}

function isNumberedStepLine(line: string, expected: number): boolean {
  const match = line.match(/^\s*(\d+)\.\s+\S/);
  return match !== null && parseInt(match[1] ?? "0", 10) === expected;
}

function isTableStart(lines: string[], index: number): boolean {
  const current = lines[index] ?? "";
  const next = lines[index + 1] ?? "";
  return isTableRow(current) && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(next);
}

// Support any standard pipe-delimited grid
function isTableRow(line: string): boolean {
  return line.includes("|") && splitTableRow(line).length >= 2;
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}
