"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";
import Navbar from "@/components/Navbar";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import Markdown from "@/components/Markdown";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState } from "react";
import { getTimeAgo } from "@/lib/utils";

export default function PostPage() {
  const { user } = useUser();
  const params = useParams();
  const postId = params.postId as Id<"posts">;
  const post = useQuery(api.posts.getPost, { postId });
  const currentUser = useQuery(api.users.getCurrentUser, user ? {} : "skip");
  const deletePost = useMutation(api.posts.deletePost);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!user || !post) return;
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deletePost({ postId });
      toast.success("Post deleted successfully");
      router.push("/");
    } catch {
      toast.error("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (post === undefined) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full animate-shimmer" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/3 rounded animate-shimmer" />
                <div className="h-3 w-1/4 rounded animate-shimmer" />
              </div>
            </div>
            <div className="h-4 w-full rounded animate-shimmer" />
            <div className="h-4 w-5/6 rounded animate-shimmer" />
            <div className="h-48 w-full rounded-xl animate-shimmer" />
          </div>
        </main>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center bg-card border border-border rounded-2xl shadow-sm p-10">
            <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="h-7 w-7 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Post not found</h1>
            <p className="text-muted-foreground mt-1">
              This post may have been deleted or doesn&apos;t exist.
            </p>
            <Link
              href="/"
              className="inline-flex mt-5 px-5 h-10 items-center bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition"
            >
              Back to home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isAuthor = currentUser?._id === post.userId;
  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground px-3 h-9 rounded-full hover:bg-muted transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/15 transition disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 3h6a1 1 0 011 1v3H8V4a1 1 0 011-1z" />
              </svg>
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>

        <article className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <Link href={`/profile/${post.userId}`} className="flex-shrink-0">
                <img
                  src={post.authorImage || "/default-avatar.png"}
                  alt={post.authorName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-border hover:ring-primary/40 transition"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${post.userId}`} className="font-semibold text-foreground hover:underline">
                  {post.authorName}
                </Link>
                <p className="text-sm text-muted-foreground">
                  @{post.authorUsername} · {timeAgo}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <Markdown>{post.text}</Markdown>
            </div>

            {post.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-border mb-4">
                <img src={post.imageUrl} alt="Post" className="w-full max-h-[36rem] object-cover" />
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-md transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 pt-3 border-t border-border">
              <LikeButton postId={post._id} initialCount={post.likesCount} />
              <div className="flex items-center gap-2 px-3 h-9 text-sm text-muted-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium">{post.commentsCount}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-muted/40 px-5 sm:px-6 py-5">
            <CommentSection postId={postId} embedded />
          </div>
        </article>
      </main>
    </div>
  );
}
