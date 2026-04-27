"use client";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  targetUserId: Id<"users">;
}

export default function FollowButton({ targetUserId }: Props) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isFollowing = useQuery(api.follows.isFollowing, user ? { targetUserId } : "skip");
  const currentUser = useQuery(api.users.getCurrentUser, user ? {} : "skip");
  const toggleFollow = useMutation(api.follows.toggleFollow);

  if (currentUser?._id === targetUserId) return null;

  const handleFollow = async () => {
    if (!user || isLoading) return;
    setIsLoading(true);
    try {
      await toggleFollow({ targetUserId });
    } catch {
      toast.error("Failed to follow user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      disabled={isLoading || !user}
      onClick={handleFollow}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`px-5 h-9 rounded-full text-sm font-semibold transition active:scale-95 disabled:opacity-50 shadow-sm ${
        isFollowing
          ? hovered
            ? "bg-destructive/10 text-destructive border border-destructive/40 backdrop-blur-md"
            : "bg-white/15 text-white border border-white/30 backdrop-blur-md"
          : "bg-white text-foreground hover:bg-white/90 border border-white/20"
      }`}
    >
      {isLoading
        ? "…"
        : isFollowing
        ? hovered
          ? "Unfollow"
          : "Following"
        : "Follow"}
    </button>
  );
}
