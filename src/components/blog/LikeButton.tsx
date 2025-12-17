"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
    slug: string;
    initialLikes?: number;
}

export default function LikeButton({ slug, initialLikes = 0 }: LikeButtonProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check local storage on mount
        const storageKey = `tengra_blog_like_${slug}`;
        const hasLiked = localStorage.getItem(storageKey);
        if (hasLiked) {
            setLiked(true);
        }
    }, [slug]);

    const handleLike = async () => {
        if (liked || loading) return;

        setLoading(true);

        // Optimistic update
        setLikes((prev) => prev + 1);
        setLiked(true);

        // Persist to local storage
        const storageKey = `tengra_blog_like_${slug}`;
        localStorage.setItem(storageKey, "true");

        try {
            // Fire and forget - validation happens on server/storage side mostly
            // In a real app we'd call an API endpoint here
            // await fetch(`/api/blogs/${slug}/like`, { method: "POST" });

            // Simulate API call for now since we don't have the endpoint ready
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            // Revert on failure
            setLikes((prev) => prev - 1);
            setLiked(false);
            localStorage.removeItem(storageKey);
            console.error("Failed to like post:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={liked || loading}
            className={cn(
                "group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                liked
                    ? "bg-rose-500/10 text-rose-500 cursor-default"
                    : "bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.1)] hover:text-rose-400"
            )}
        >
            <div className="relative">
                <Heart
                    className={cn(
                        "w-5 h-5 transition-transform duration-300",
                        liked ? "fill-current scale-110" : "group-hover:scale-110"
                    )}
                />
                <AnimatePresence>
                    {liked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-rose-500 rounded-full z-[-1]"
                        />
                    )}
                </AnimatePresence>
            </div>
            <span className="font-medium tabular-nums min-w-[1ch]">{likes}</span>
        </button>
    );
}
