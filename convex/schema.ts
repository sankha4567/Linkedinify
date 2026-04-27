import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - stores all user profiles
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    username: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"]),

  // Posts table - stores all posts
  posts: defineTable({
    userId: v.id("users"),
    text: v.string(),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_createdAt", ["createdAt"]),

  // Likes table - stores who liked which post
  likes: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_post_and_user", ["postId", "userId"]),

  // Comments table - stores comments on posts
  comments: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    text: v.string(),
    createdAt: v.number(),
    parentCommentId: v.optional(v.id("comments")),
    editedAt: v.optional(v.number()),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentCommentId"]),

  // Follows table - stores who follows whom
  follows: defineTable({
    followerId: v.id("users"),   // The person who follows
    followingId: v.id("users"),  // The person being followed
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_follower_and_following", ["followerId", "followingId"]),
});
