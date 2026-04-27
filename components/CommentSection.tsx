"use client";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";
import { useState } from "react";
import CommentItem from "./CommentItem";

export default function CommentSection({
  postId,
  embedded = false,
}: {
  postId: Id<"posts">;
  embedded?: boolean;
}) {
  const { user } = useUser();
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const comments = useQuery(api.comments.getComments, { postId });
  const addComment = useMutation(api.comments.addComment);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment({ text: text.trim(), postId });
      setText("");
    } catch {
      toast.error("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const wrapperClass = embedded
    ? ""
    : "bg-card border border-border rounded-2xl p-4 sm:p-5";

  return (
    <div className={wrapperClass}>
      <h3 className="text-base font-semibold text-foreground mb-4">
        Comments <span className="text-muted-foreground font-normal">({comments?.length ?? 0})</span>
      </h3>

      <form onSubmit={handleSubmit} className="flex gap-2.5 pb-4 border-b border-border mb-4">
        <img
          src={user?.imageUrl || "/default-avatar.png"}
          alt="Your avatar"
          className="w-9 h-9 rounded-full object-cover ring-2 ring-border flex-shrink-0"
        />
        <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-full pl-4 pr-1 py-1 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment…"
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            className="bg-primary text-primary-foreground h-8 px-4 rounded-full text-sm font-semibold transition active:scale-95 hover:opacity-90 disabled:opacity-40"
          >
            {isSubmitting ? "…" : "Post"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments === undefined ? (
          <p className="text-muted-foreground text-sm text-center py-4">Loading comments…</p>
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((c) => <CommentItem key={c._id} comment={c} postId={postId} />)
        )}
      </div>
    </div>
  );
}
