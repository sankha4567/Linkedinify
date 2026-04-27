// @vitest-environment edge-runtime
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";
import type { Id } from "./_generated/dataModel";

const setup = async () => {
  const t = convexTest(schema);
  const ids = await t.run(async (ctx) => {
    const aliceId = await ctx.db.insert("users", {
      clerkId: "alice",
      name: "Alice",
      username: "alice",
      email: "a@e.com",
      imageUrl: "",
      createdAt: Date.now(),
    });
    const bobId = await ctx.db.insert("users", {
      clerkId: "bob",
      name: "Bob",
      username: "bob",
      email: "b@e.com",
      imageUrl: "",
      createdAt: Date.now(),
    });
    return { aliceId, bobId };
  });
  return {
    t,
    asAlice: t.withIdentity({ subject: "alice" }),
    asBob: t.withIdentity({ subject: "bob" }),
    aliceId: ids.aliceId as Id<"users">,
    bobId: ids.bobId as Id<"users">,
  };
};

describe("follows.toggleFollow", () => {
  it("throws when targeting yourself", async () => {
    const { asAlice, aliceId } = await setup();
    await expect(
      asAlice.mutation(api.follows.toggleFollow, { targetUserId: aliceId })
    ).rejects.toThrow(/cannot follow yourself/i);
  });

  it("follows then unfollows on consecutive calls", async () => {
    const { asAlice, bobId } = await setup();

    const first = await asAlice.mutation(api.follows.toggleFollow, { targetUserId: bobId });
    expect(first.following).toBe(true);
    expect(await asAlice.query(api.follows.isFollowing, { targetUserId: bobId })).toBe(true);

    const second = await asAlice.mutation(api.follows.toggleFollow, { targetUserId: bobId });
    expect(second.following).toBe(false);
    expect(await asAlice.query(api.follows.isFollowing, { targetUserId: bobId })).toBe(false);
  });
});

describe("follows.isFollowing", () => {
  it("returns false when unauthenticated", async () => {
    const { t, bobId } = await setup();
    expect(await t.query(api.follows.isFollowing, { targetUserId: bobId })).toBe(false);
  });
});
