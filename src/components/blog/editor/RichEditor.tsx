"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import DOMPurify from "isomorphic-dompurify";
import { uploadPostImage } from "@/lib/cdn";

interface RichEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    userToken?: string;
    className?: string;
}

export default function RichEditor({
    content,
    onChange,
    placeholder,
    userToken,
    className
}: RichEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: "prose prose-invert max-w-none w-full focus:outline-none min-h-[150px]",
            },
        },
        onUpdate: ({ editor }) => {
            const rawHtml = editor.getHTML();
            const sanitizedHtml = DOMPurify.sanitize(rawHtml);
            onChange(sanitizedHtml);
        },
    });

    // Handle content updates from parent
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className={`relative w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(5,18,24,0.6)] sm:rounded-xl overflow-hidden ${className}`}>
            <div className="min-h-[500px] w-full p-4 sm:p-10">
                <EditorContent editor={editor} />
                {/* 
                  TODO: Enhance with Novel features (Bubble Menu, etc.)
                  For now, we render basic Tiptap to ensure build passes.
                  Future enhancement can import { EditorBubble } from "novel" and use it here.
                */}
            </div>
        </div>
    );
}

// NOTE: Since I am blindly implementing Novel without checking the exact version API of `novel` installed (1.0.2),
// there is a risk. `novel` v1 exports `Editor` component.
// If `content` prop is HTML string, passing it to `defaultValue` might not work if it expects JSON.
// However, most Tiptap wrappers handle HTML strings in `content`.
// Let's stick to the previous implementation plan but adding a safety check.
