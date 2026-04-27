"use client";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { getTimeAgo } from "@/lib/utils";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";

interface BaseComment {
  _id: Id<"comments">;
  postId: Id<"posts">;
  userId: Id<"users">;
  text: string;
  createdAt: number;
  editedAt?: number;
  userName: string;
  userUsername: string;
  userImage: string;
}

export interface ThreadedComment extends BaseComment {
  replies?: BaseComment[];
}

export default function CommentItem({
  comment,
  postId,
  isReply = false,
}: {
  comment: ThreadedComment;
  postId: Id<"posts">;
  isReply?: boolean;
}) {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser, user ? {} : "skip");
  const editComment = useMutation(api.comments.editComment);
  const deleteComment = useMutation(api.comments.deleteComment);
  const addComment = useMutation(api.comments.addComment);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [savingEdit, setSavingEdit] = useState(false);

  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const isOwner = currentUser?._id === comment.userId;
  const timeAgo = getTimeAgo(comment.createdAt);

  const handleEdit = async () => {
    if (!editText.trim() || editText.trim() === comment.text) {
      setIsEditing(false);
      return;
    }
    setSavingEdit(true);
    try {
      await editComment({ commentId: comment._id, text: editText.trim() });
      setIsEditing(false);
    } catch {
      toast.error("Failed to update comment");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment({ commentId: comment._id });
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await addComment({
        postId,
        text: replyText.trim(),
        parentCommentId: comment._id,
      });
      setReplyText("");
      setReplying(false);
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Link href={`/profile/${comment.userId}`} className="flex-shrink-0">
        <img
          src={comment.userImage || "/default-avatar.png"}
          alt={comment.userName}
          className={`${isReply ? "w-7 h-7" : "w-9 h-9"} rounded-full object-cover ring-2 ring-border hover:ring-primary/40 transition`}
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/profile/${comment.userId}`}>
              <span className="font-semibold text-foreground text-sm hover:underline">
                {comment.userName}
              </span>
            </Link>
            <span className="text-xs text-muted-foreground">@{comment.userUsername}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {comment.editedAt && (
              <span className="text-xs text-muted-foreground italic">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.text);
                  }}
                  className="text-xs px-3 h-7 rounded-full text-muted-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={savingEdit || !editText.trim()}
                  className="text-xs px-3 h-7 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {savingEdit ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-foreground/90 text-sm mt-0.5 leading-relaxed whitespace-pre-wrap">
              {comment.text}
            </p>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 mt-1 ml-1">
            {!isReply && (
              <button
                onClick={() => setReplying((r) => !r)}
                className="text-xs font-medium text-muted-foreground hover:text-primary px-2 py-1 rounded transition"
              >
                Reply
              </button>
            )}
            {isOwner && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-medium text-muted-foreground hover:text-primary px-2 py-1 rounded transition"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs font-medium text-muted-foreground hover:text-destructive px-2 py-1 rounded transition"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}

        {replying && (
          <form onSubmit={handleReply} className="mt-2 flex gap-2">
            <img
              src={user?.imageUrl || "/default-avatar.png"}
              alt="You"
              className="w-7 h-7 rounded-full object-cover ring-2 ring-border flex-shrink-0"
            />
            <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-full pl-3 pr-1 py-1 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.userName}…`}
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                autoFocus
              />
              <button
                type="submit"
                disabled={submittingReply || !replyText.trim()}
                className="bg-primary text-primary-foreground h-7 px-3 rounded-full text-xs font-semibold transition active:scale-95 hover:opacity-90 disabled:opacity-40"
              >
                {submittingReply ? "…" : "Reply"}
              </button>
            </div>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-2 border-l-2 border-border">
            {comment.replies.map((r) => (
              <CommentItem
                key={r._id}
                comment={r}
                postId={postId}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
