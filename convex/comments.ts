import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    text: v.string(),
    parentCommentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    let parentCommentId: typeof args.parentCommentId = args.parentCommentId;
    if (parentCommentId) {
      const parent = await ctx.db.get(parentCommentId);
      if (!parent) throw new Error("Parent comment not found");
      if (parent.postId !== args.postId) throw new Error("Parent comment is on a different post");
      // Cap nesting at 1 level: if replying to a reply, attach to its top-level parent instead.
      if (parent.parentCommentId) parentCommentId = parent.parentCommentId;
    }

    const commentId = await ctx.db.insert("comments", {
      userId: user._id,
      postId: args.postId,
      text: args.text,
      createdAt: Date.now(),
      parentCommentId,
    });

    return commentId;
  },
});

export const editComment = mutation({
  args: {
    commentId: v.id("comments"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== user._id) throw new Error("Not your comment");

    const trimmed = args.text.trim();
    if (!trimmed) throw new Error("Comment cannot be empty");

    await ctx.db.patch(args.commentId, {
      text: trimmed,
      editedAt: Date.now(),
    });
  },
});

export const getComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .collect();

    const enriched = await Promise.all(
      all.map(async (c) => {
        const user = await ctx.db.get(c.userId);
        return {
          ...c,
          userName: user?.name || "Unknown",
          userUsername: user?.username || "unknown",
          userImage: user?.imageUrl || "",
        };
      })
    );

    type Enriched = (typeof enriched)[number];
    type Threaded = Enriched & { replies: Enriched[] };

    const topLevel: Threaded[] = enriched
      .filter((c) => !c.parentCommentId)
      .map((c) => ({ ...c, replies: [] }));

    const byParent = new Map<string, Enriched[]>();
    for (const c of enriched) {
      if (c.parentCommentId) {
        const arr = byParent.get(c.parentCommentId) ?? [];
        arr.push(c);
        byParent.set(c.parentCommentId, arr);
      }
    }
    for (const t of topLevel) {
      t.replies = byParent.get(t._id) ?? [];
    }

    return topLevel;
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== user._id) throw new Error("Not your comment");

    // Also delete any replies to this comment
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentCommentId", args.commentId))
      .collect();
    for (const r of replies) await ctx.db.delete(r._id);

    await ctx.db.delete(args.commentId);
  },
});
