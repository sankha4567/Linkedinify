"use client";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  postId: Id<"posts">;
  initialCount: number;
}

export default function LikeButton({ postId, initialCount }: Props) {
  const { user } = useUser();
  const [isLiking, setIsLiking] = useState(false);
  const hasLiked = useQuery(api.likes.hasLiked, user ? { postId } : "skip");
  const toggleLike = useMutation(api.likes.toggleLike);

  const handleLike = async () => {
    if (!user || isLiking) return;
    setIsLiking(true);
    try {
      await toggleLike({ postId });
    } catch {
      toast.error("Failed to like post. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLiking || !user}
      className={`flex items-center gap-2 px-3 h-9 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
        hasLiked
          ? "text-rose-500 bg-rose-500/10 hover:bg-rose-500/15"
          : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
      }`}
    >
      <svg
        className={`w-5 h-5 transition-transform ${isLiking ? "scale-90" : "scale-100"}`}
        fill={hasLiked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span>{initialCount}</span>
    </button>
  );
}
