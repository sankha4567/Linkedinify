// @vitest-environment edge-runtime
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";

const setup = async () => {
  const t = convexTest(schema);
  await t.run(async (ctx) => {
    await ctx.db.insert("users", {
      clerkId: "alice",
      name: "Alice",
      username: "alice",
      email: "a@e.com",
      imageUrl: "",
      createdAt: Date.now(),
    });
    await ctx.db.insert("users", {
      clerkId: "bob",
      name: "Bob",
      username: "bob",
      email: "b@e.com",
      imageUrl: "",
      createdAt: Date.now(),
    });
  });
  const asAlice = t.withIdentity({ subject: "alice" });
  const asBob = t.withIdentity({ subject: "bob" });
  const postId = await asAlice.mutation(api.posts.createPost, { text: "p" });
  return { t, asAlice, asBob, postId };
};

describe("likes.toggleLike", () => {
  it("throws when not authenticated", async () => {
    const { t, postId } = await setup();
    await expect(
      t.mutation(api.likes.toggleLike, { postId })
    ).rejects.toThrow(/not authenticated/i);
  });

  it("toggles a like on then off across two calls", async () => {
    const { asBob, postId } = await setup();

    const first = await asBob.mutation(api.likes.toggleLike, { postId });
    expect(first.liked).toBe(true);
    expect(await asBob.query(api.likes.hasLiked, { postId })).toBe(true);

    const second = await asBob.mutation(api.likes.toggleLike, { postId });
    expect(second.liked).toBe(false);
    expect(await asBob.query(api.likes.hasLiked, { postId })).toBe(false);
  });
});

describe("likes.hasLiked", () => {
  it("returns false when unauthenticated", async () => {
    const { t, postId } = await setup();
    expect(await t.query(api.likes.hasLiked, { postId })).toBe(false);
  });

  it("returns false when the user has not liked the post", async () => {
    const { asBob, postId } = await setup();
    expect(await asBob.query(api.likes.hasLiked, { postId })).toBe(false);
  });
});
