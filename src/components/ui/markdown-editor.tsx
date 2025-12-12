"use client";

import { useState, useMemo, useCallback } from "react";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image, Code, Quote, Heading1, Heading2, Eye, Edit } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    height?: number;
    preview?: "edit" | "preview" | "live";
    className?: string;
}

/**
 * Custom lightweight Markdown editor with toolbar and live preview.
 * Replaces @uiw/react-md-editor to avoid CSP and Tailwind bundling conflicts.
 */
export function MarkdownEditor({
    value,
    onChange,
    height = 400,
    preview: initialPreview = "edit",
    className,
}: MarkdownEditorProps) {
    const [mode, setMode] = useState<"edit" | "preview">(initialPreview === "preview" ? "preview" : "edit");

    // Insert text at cursor position or wrap selection
    const insertText = useCallback(
        (before: string, after: string = "") => {
            const textarea = document.getElementById("md-textarea") as HTMLTextAreaElement;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = value.substring(start, end);
            const newValue = value.substring(0, start) + before + selected + after + value.substring(end);

            onChange(newValue);

            // Restore cursor position after React re-render
            setTimeout(() => {
                textarea.focus();
                const newPos = start + before.length + selected.length + after.length;
                textarea.setSelectionRange(newPos, newPos);
            }, 10);
        },
        [value, onChange]
    );

    const toolbarActions = useMemo(
        () => [
            { icon: Bold, action: () => insertText("**", "**"), title: "Bold" },
            { icon: Italic, action: () => insertText("*", "*"), title: "Italic" },
            { icon: Heading1, action: () => insertText("\n# ", ""), title: "Heading 1" },
            { icon: Heading2, action: () => insertText("\n## ", ""), title: "Heading 2" },
            { icon: Quote, action: () => insertText("\n> ", ""), title: "Quote" },
            { icon: Code, action: () => insertText("`", "`"), title: "Inline Code" },
            { icon: List, action: () => insertText("\n- ", ""), title: "Bullet List" },
            { icon: ListOrdered, action: () => insertText("\n1. ", ""), title: "Numbered List" },
            { icon: LinkIcon, action: () => insertText("[", "](url)"), title: "Link" },
            { icon: Image, action: () => insertText("![alt](", ")"), title: "Image" },
        ],
        [insertText]
    );

    // Simple markdown to HTML conversion using regex (no external lib)
    const renderedHtml = useMemo(() => {
        let html = value;

        // Escape HTML first
        html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // Code blocks (```...```)
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="md-code-block"><code>$2</code></pre>');

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

        // Headings
        html = html.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>');

        // Bold and italic
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
        html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
        html = html.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");
        html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
        html = html.replace(/_(.+?)_/g, "<em>$1</em>");

        // Blockquotes
        html = html.replace(/^> (.+)$/gm, '<blockquote class="md-quote">$1</blockquote>');

        // Images
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-img" />');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="md-link" target="_blank" rel="noopener noreferrer">$1</a>');

        // Unordered lists
        html = html.replace(/^- (.+)$/gm, '<li class="md-li">$1</li>');
        html = html.replace(/(<li class="md-li">.*<\/li>\n?)+/g, '<ul class="md-ul">$&</ul>');

        // Ordered lists
        html = html.replace(/^\d+\. (.+)$/gm, '<li class="md-li-ol">$1</li>');
        html = html.replace(/(<li class="md-li-ol">.*<\/li>\n?)+/g, '<ol class="md-ol">$&</ol>');

        // Horizontal rule
        html = html.replace(/^---$/gm, '<hr class="md-hr" />');

        // Paragraphs (double newlines)
        html = html.replace(/\n\n/g, "</p><p>");
        html = `<p>${html}</p>`;

        // Cleanup empty paragraphs
        html = html.replace(/<p><\/p>/g, "");
        html = html.replace(/<p>(<h[1-6])/g, "$1");
        html = html.replace(/(<\/h[1-6]>)<\/p>/g, "$1");
        html = html.replace(/<p>(<ul)/g, "$1");
        html = html.replace(/(<\/ul>)<\/p>/g, "$1");
        html = html.replace(/<p>(<ol)/g, "$1");
        html = html.replace(/(<\/ol>)<\/p>/g, "$1");
        html = html.replace(/<p>(<blockquote)/g, "$1");
        html = html.replace(/(<\/blockquote>)<\/p>/g, "$1");
        html = html.replace(/<p>(<pre)/g, "$1");
        html = html.replace(/(<\/pre>)<\/p>/g, "$1");

        return DOMPurify.sanitize(html);
    }, [value]);

    return (
        <div className={cn("flex flex-col rounded-xl border border-border bg-background overflow-hidden", className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-2 py-1.5">
                {toolbarActions.map(({ icon: Icon, action, title }, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={action}
                        title={title}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Icon className="w-4 h-4" />
                    </button>
                ))}
                <div className="flex-1" />
                <button
                    type="button"
                    onClick={() => setMode("edit")}
                    className={cn(
                        "p-1.5 rounded transition-colors",
                        mode === "edit" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Edit"
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => setMode("preview")}
                    className={cn(
                        "p-1.5 rounded transition-colors",
                        mode === "preview" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Preview"
                >
                    <Eye className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            {mode === "edit" ? (
                <textarea
                    id="md-textarea"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ height }}
                    className="w-full resize-none p-4 font-mono text-sm bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                    placeholder="Write your markdown here..."
                />
            ) : (
                <div
                    className="md-preview p-4 overflow-auto prose prose-invert max-w-none"
                    style={{ height }}
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
            )}

            {/* Preview styles */}
            <style jsx global>{`
        .md-preview .md-h1 { font-size: 1.75rem; font-weight: 700; margin: 0.5rem 0; }
        .md-preview .md-h2 { font-size: 1.5rem; font-weight: 600; margin: 0.5rem 0; }
        .md-preview .md-h3 { font-size: 1.25rem; font-weight: 600; margin: 0.5rem 0; }
        .md-preview .md-quote { border-left: 3px solid var(--primary); padding-left: 1rem; margin: 0.5rem 0; opacity: 0.9; font-style: italic; }
        .md-preview .md-code-block { background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 0.5rem 0; }
        .md-preview .md-code-block code { font-family: monospace; font-size: 0.875rem; }
        .md-preview .md-inline-code { background: rgba(255,255,255,0.1); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em; }
        .md-preview .md-link { color: var(--primary); text-decoration: underline; }
        .md-preview .md-img { max-width: 100%; border-radius: 0.5rem; margin: 0.5rem 0; }
        .md-preview .md-ul, .md-preview .md-ol { padding-left: 1.5rem; margin: 0.5rem 0; }
        .md-preview .md-li, .md-preview .md-li-ol { margin: 0.25rem 0; }
        .md-preview .md-hr { border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 1rem 0; }
        .md-preview p { margin: 0.5rem 0; line-height: 1.6; }
      `}</style>
        </div>
    );
}

export default MarkdownEditor;
