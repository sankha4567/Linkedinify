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
      className={`px-5 h-9 rounded-full text-sm font-semibold transition active:scale-95 disabled:opacity-50 ${
        isFollowing
          ? "bg-muted text-foreground border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          : "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
      }`}
    >
      {isLoading ? "…" : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
