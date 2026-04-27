import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPost = mutation({
  args: {
    text: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    let imageUrl: string | undefined;
    if (args.imageStorageId) {
      imageUrl = (await ctx.storage.getUrl(args.imageStorageId)) || undefined;
    }

    const postId = await ctx.db.insert("posts", {
      userId: user._id,
      text: args.text,
      imageUrl: imageUrl,
      tags: args.tags || [],
      createdAt: Date.now(),
    });

    return postId;
  },
});

export const getFeedPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").take(50);

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        const likes = await ctx.db
          .query("likes")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        return {
          ...post,
          authorName: user?.name || "Unknown",
          authorUsername: user?.username || "unknown",
          authorImage: user?.imageUrl || "",
          likesCount: likes.length,
          commentsCount: comments.length,
        };
      })
    );

    return postsWithDetails;
  },
});

export const getFollowingFeed = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) return [];

    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", currentUser._id))
      .collect();

    const followingIds = following.map((f) => f.followingId);
    if (followingIds.length === 0) return [];

    const allPosts = await ctx.db.query("posts").order("desc").take(100);
    const filteredPosts = allPosts.filter((post) => followingIds.includes(post.userId));

    const postsWithDetails = await Promise.all(
      filteredPosts.slice(0, 50).map(async (post) => {
        const user = await ctx.db.get(post.userId);
        const likes = await ctx.db
          .query("likes")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        return {
          ...post,
          authorName: user?.name || "Unknown",
          authorUsername: user?.username || "unknown",
          authorImage: user?.imageUrl || "",
          likesCount: likes.length,
          commentsCount: comments.length,
        };
      })
    );

    return postsWithDetails;
  },
});

export const getUserPosts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const user = await ctx.db.get(args.userId);

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const likes = await ctx.db
          .query("likes")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        return {
          ...post,
          authorName: user?.name || "Unknown",
          authorUsername: user?.username || "unknown",
          authorImage: user?.imageUrl || "",
          likesCount: likes.length,
          commentsCount: comments.length,
        };
      })
    );

    return postsWithDetails;
  },
});

export const getPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    const user = await ctx.db.get(post.userId);
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .collect();
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .collect();

    return {
      ...post,
      authorName: user?.name || "Unknown",
      authorUsername: user?.username || "unknown",
      authorImage: user?.imageUrl || "",
      likesCount: likes.length,
      commentsCount: comments.length,
    };
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.userId !== user._id) throw new Error("Not your post");

    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(args.postId);
  },
});

export const searchPosts = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) return [];

    const allPosts = await ctx.db.query("posts").order("desc").take(100);
    const searchLower = args.searchTerm.toLowerCase();

    const filteredPosts = allPosts.filter(
      (post) =>
        post.text.toLowerCase().includes(searchLower) ||
        (post.tags && post.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
    );

    const postsWithDetails = await Promise.all(
      filteredPosts.slice(0, 20).map(async (post) => {
        const user = await ctx.db.get(post.userId);
        const likes = await ctx.db
          .query("likes")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        return {
          ...post,
          authorName: user?.name || "Unknown",
          authorUsername: user?.username || "unknown",
          authorImage: user?.imageUrl || "",
          likesCount: likes.length,
          commentsCount: comments.length,
        };
      })
    );

    return postsWithDetails;
  },
});
