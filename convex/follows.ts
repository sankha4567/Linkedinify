import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggleFollow = mutation({
  args: {
    targetUserId: v.id("users"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) throw new Error("User not found");
    if (currentUser._id === args.targetUserId) throw new Error("Cannot follow yourself");

    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.targetUserId)
      )
      .first();

    if (existingFollow) {
      await ctx.db.delete(existingFollow._id);
      return { following: false };
    } else {
      await ctx.db.insert("follows", {
        followerId: currentUser._id,
        followingId: args.targetUserId,
        createdAt: Date.now(),
      });
      return { following: true };
    }
  },
});

export const isFollowing = query({
  args: {
    targetUserId: v.id("users"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) return false;

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.targetUserId)
      )
      .first();

    return !!follow;
  },
});

export const getFollowers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect();

    const followers = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followerId);
        return {
          ...follow,
          userId: follow.followerId,
          name: user?.name || "Unknown",
          username: user?.username || "unknown",
          imageUrl: user?.imageUrl || "",
          bio: user?.bio || "",
        };
      })
    );

    return followers;
  },
});

export const getFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    const following = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followingId);
        return {
          ...follow,
          userId: follow.followingId,
          name: user?.name || "Unknown",
          username: user?.username || "unknown",
          imageUrl: user?.imageUrl || "",
          bio: user?.bio || "",
        };
      })
    );

    return following;
  },
});