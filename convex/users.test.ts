// @vitest-environment edge-runtime
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";

const seedUser = async (
  t: ReturnType<typeof convexTest>,
  clerkId: string,
  overrides: Partial<{
    name: string;
    username: string;
    email: string;
    imageUrl: string;
    skills: string[];
  }> = {}
) => {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      clerkId,
      name: overrides.name ?? "Test User",
      username: overrides.username ?? `testuser_${clerkId}`,
      email: overrides.email ?? `${clerkId}@example.com`,
      imageUrl: overrides.imageUrl ?? "",
      skills: overrides.skills,
      createdAt: Date.now(),
    });
  });
};

describe("users.createOrUpdateUser", () => {
  it("throws when not authenticated", async () => {
    const t = convexTest(schema);
    await expect(
      t.mutation(api.users.createOrUpdateUser, {
        name: "Alice",
        email: "alice@example.com",
        imageUrl: "",
      })
    ).rejects.toThrow(/not authenticated/i);
  });

  it("creates a new user keyed by the verified clerk identity, ignoring any spoofed clerkId", async () => {
    const t = convexTest(schema);
    const asAlice = t.withIdentity({ subject: "clerk_alice" });

    await asAlice.mutation(api.users.createOrUpdateUser, {
      name: "Alice",
      email: "alice@example.com",
      imageUrl: "https://example.com/a.png",
    });

    const stored = await t.run(async (ctx) =>
      ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", "clerk_alice"))
        .first()
    );

    expect(stored?.name).toBe("Alice");
    expect(stored?.clerkId).toBe("clerk_alice");
    expect(stored?.username).toMatch(/^alice/);
  });

  it("updates name and email on a subsequent call, but preserves the user's customised imageUrl", async () => {
    const t = convexTest(schema);
    const asAlice = t.withIdentity({ subject: "clerk_alice" });

    await asAlice.mutation(api.users.createOrUpdateUser, {
      name: "Alice",
      email: "old@example.com",
      imageUrl: "clerk-default.png",
    });

    // Simulate the user setting a custom photo via Edit Profile
    await t.run(async (ctx) => {
      const u = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", "clerk_alice"))
        .first();
      if (u) await ctx.db.patch(u._id, { imageUrl: "user-uploaded.png" });
    });

    // Subsequent page load syncs name/email but must not clobber imageUrl
    await asAlice.mutation(api.users.createOrUpdateUser, {
      name: "Alice Smith",
      email: "new@example.com",
      imageUrl: "clerk-default-2.png",
    });

    const all = await t.run(async (ctx) =>
      ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", "clerk_alice"))
        .collect()
    );

    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("Alice Smith");
    expect(all[0].email).toBe("new@example.com");
    expect(all[0].imageUrl).toBe("user-uploaded.png");
  });
});

describe("users.getCurrentUser", () => {
  it("returns null when not authenticated", async () => {
    const t = convexTest(schema);
    const result = await t.query(api.users.getCurrentUser, {});
    expect(result).toBeNull();
  });

  it("returns the matching user when authenticated", async () => {
    const t = convexTest(schema);
    await seedUser(t, "clerk_alice", { name: "Alice" });
    const asAlice = t.withIdentity({ subject: "clerk_alice" });
    const me = await asAlice.query(api.users.getCurrentUser, {});
    expect(me?.name).toBe("Alice");
  });
});

describe("users.searchUsers", () => {
  it("returns empty when search term is empty/whitespace", async () => {
    const t = convexTest(schema);
    expect(await t.query(api.users.searchUsers, { searchTerm: "" })).toEqual([]);
    expect(await t.query(api.users.searchUsers, { searchTerm: "   " })).toEqual([]);
  });

  it("finds users by name, username, and skills (case-insensitive)", async () => {
    const t = convexTest(schema);
    await seedUser(t, "u1", { name: "Alice Cooper", username: "alicec" });
    await seedUser(t, "u2", { name: "Bob", username: "bobby" });
    await seedUser(t, "u3", { name: "Carol", username: "carol", skills: ["React", "TypeScript"] });

    const byName = await t.query(api.users.searchUsers, { searchTerm: "alice" });
    expect(byName.map((u) => u.name)).toEqual(["Alice Cooper"]);

    const byUsername = await t.query(api.users.searchUsers, { searchTerm: "bobby" });
    expect(byUsername.map((u) => u.name)).toEqual(["Bob"]);

    const bySkill = await t.query(api.users.searchUsers, { searchTerm: "react" });
    expect(bySkill.map((u) => u.name)).toEqual(["Carol"]);
  });
});

describe("users.updateProfile", () => {
  it("rejects taking another user's username", async () => {
    const t = convexTest(schema);
    await seedUser(t, "u1", { username: "alice" });
    await seedUser(t, "u2", { username: "bob" });

    const asBob = t.withIdentity({ subject: "u2" });
    await expect(
      asBob.mutation(api.users.updateProfile, {
        name: "Bob",
        username: "alice",
      })
    ).rejects.toThrow(/already taken/i);
  });

  it("allows a user to update their own profile", async () => {
    const t = convexTest(schema);
    await seedUser(t, "u1", { name: "Alice", username: "alice" });
    const asAlice = t.withIdentity({ subject: "u1" });

    await asAlice.mutation(api.users.updateProfile, {
      name: "Alice Smith",
      username: "alicesmith",
      bio: "hello world",
      skills: ["Convex"],
    });

    const me = await asAlice.query(api.users.getCurrentUser, {});
    expect(me?.name).toBe("Alice Smith");
    expect(me?.username).toBe("alicesmith");
    expect(me?.bio).toBe("hello world");
    expect(me?.skills).toEqual(["Convex"]);
  });
});
