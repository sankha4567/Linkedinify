// @vitest-environment edge-runtime
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";
import type { Id } from "./_generated/dataModel";

const seedUser = async (t: ReturnType<typeof convexTest>, clerkId: string, name = clerkId) => {
  return await t.run(async (ctx) =>
    ctx.db.insert("users", {
      clerkId,
      name,
      username: clerkId,
      email: `${clerkId}@example.com`,
      imageUrl: "",
      createdAt: Date.now(),
    })
  );
};

describe("posts.createPost", () => {
  it("throws when not authenticated", async () => {
    const t = convexTest(schema);
    await expect(
      t.mutation(api.posts.createPost, { text: "hello" })
    ).rejects.toThrow(/not authenticated/i);
  });

  it("throws when there is no user row for the authenticated identity", async () => {
    const t = convexTest(schema);
    const asGhost = t.withIdentity({ subject: "ghost_user" });
    await expect(
      asGhost.mutation(api.posts.createPost, { text: "hello" })
    ).rejects.toThrow(/user not found/i);
  });

  it("creates a post tied to the authenticated user", async () => {
    const t = convexTest(schema);
    const aliceId = await seedUser(t, "clerk_alice", "Alice");
    const asAlice = t.withIdentity({ subject: "clerk_alice" });

    const postId = await asAlice.mutation(api.posts.createPost, {
      text: "first post",
      tags: ["intro"],
    });

    const post = await t.query(api.posts.getPost, { postId });
    expect(post?.text).toBe("first post");
    expect(post?.userId).toBe(aliceId);
    expect(post?.authorName).toBe("Alice");
    expect(post?.tags).toEqual(["intro"]);
  });
});

describe("posts.getFeedPosts", () => {
  it("returns latest posts in descending order with author metadata", async () => {
    const t = convexTest(schema);
    await seedUser(t, "u1", "Alice");
    await seedUser(t, "u2", "Bob");

    const asAlice = t.withIdentity({ subject: "u1" });
    const asBob = t.withIdentity({ subject: "u2" });

    await asAlice.mutation(api.posts.createPost, { text: "alice 1" });
    await new Promise((r) => setTimeout(r, 1));
    await asBob.mutation(api.posts.createPost, { text: "bob 1" });

    const feed = await t.query(api.posts.getFeedPosts, {});
    expect(feed).toHaveLength(2);
    expect(feed[0].text).toBe("bob 1");
    expect(feed[0].authorName).toBe("Bob");
    expect(feed[1].text).toBe("alice 1");
    expect(feed[1].authorName).toBe("Alice");
  });
});

describe("posts.getFollowingFeed", () => {
  it("returns an empty list when unauthenticated", async () => {
    const t = convexTest(schema);
    expect(await t.query(api.posts.getFollowingFeed, {})).toEqual([]);
  });

  it("returns empty when the user follows nobody", async () => {
    const t = convexTest(schema);
    await seedUser(t, "u1");
    const asU1 = t.withIdentity({ subject: "u1" });
    expect(await asU1.query(api.posts.getFollowingFeed, {})).toEqual([]);
  });

  it("returns posts from followed users only — not your own", async () => {
    const t = convexTest(schema);
    const aliceId = await seedUser(t, "alice", "Alice");
    const bobId = await seedUser(t, "bob", "Bob");

    const asAlice = t.withIdentity({ subject: "alice" });
    const asBob = t.withIdentity({ subject: "bob" });

    // Alice follows Bob (mutation handles auth)
    await asAlice.mutation(api.follows.toggleFollow, { targetUserId: bobId });

    await asAlice.mutation(api.posts.createPost, { text: "alice's own post" });
    await asBob.mutation(api.posts.createPost, { text: "bob's post" });

    const feed = await asAlice.query(api.posts.getFollowingFeed, {});
    expect(feed.map((p) => p.text)).toEqual(["bob's post"]);
    expect(feed[0].userId).toBe(bobId);
  });
});

describe("posts.deletePost", () => {
  it("rejects deletion by a non-author", async () => {
    const t = convexTest(schema);
    await seedUser(t, "alice", "Alice");
    await seedUser(t, "mallory", "Mallory");

    const asAlice = t.withIdentity({ subject: "alice" });
    const postId = await asAlice.mutation(api.posts.createPost, { text: "alice's post" });

    const asMallory = t.withIdentity({ subject: "mallory" });
    await expect(
      asMallory.mutation(api.posts.deletePost, { postId })
    ).rejects.toThrow(/not your post/i);
  });

  it("cascades likes and comments when deleting", async () => {
    const t = convexTest(schema);
    await seedUser(t, "alice", "Alice");
    await seedUser(t, "bob", "Bob");
    const asAlice = t.withIdentity({ subject: "alice" });
    const asBob = t.withIdentity({ subject: "bob" });

    const postId = await asAlice.mutation(api.posts.createPost, { text: "delete me" });
    await asBob.mutation(api.likes.toggleLike, { postId });
    await asBob.mutation(api.comments.addComment, { postId, text: "nice" });

    await asAlice.mutation(api.posts.deletePost, { postId });

    const post = await t.query(api.posts.getPost, { postId });
    expect(post).toBeNull();

    const likesAfter = await t.run(async (ctx) =>
      ctx.db
        .query("likes")
        .withIndex("by_post", (q) => q.eq("postId", postId as Id<"posts">))
        .collect()
    );
    expect(likesAfter).toHaveLength(0);

    const commentsAfter = await t.run(async (ctx) =>
      ctx.db
        .query("comments")
        .withIndex("by_post", (q) => q.eq("postId", postId as Id<"posts">))
        .collect()
    );
    expect(commentsAfter).toHaveLength(0);
  });
});

describe("posts.searchPosts", () => {
  it("finds posts by text and by tag (case-insensitive), and returns empty for empty term", async () => {
    const t = convexTest(schema);
    await seedUser(t, "u1", "Alice");
    const asAlice = t.withIdentity({ subject: "u1" });
    await asAlice.mutation(api.posts.createPost, { text: "Loving Convex today", tags: ["convex"] });
    await asAlice.mutation(api.posts.createPost, { text: "React 19 is great", tags: ["react"] });

    expect(await t.query(api.posts.searchPosts, { searchTerm: "" })).toEqual([]);

    const byText = await t.query(api.posts.searchPosts, { searchTerm: "convex" });
    expect(byText.map((p) => p.text)).toContain("Loving Convex today");

    const byTag = await t.query(api.posts.searchPosts, { searchTerm: "react" });
    expect(byTag.map((p) => p.text)).toContain("React 19 is great");
  });
});
