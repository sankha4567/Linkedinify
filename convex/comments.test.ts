// @vitest-environment edge-runtime
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";

const seedUser = async (t: ReturnType<typeof convexTest>, clerkId: string, name = clerkId) =>
  t.run(async (ctx) =>
    ctx.db.insert("users", {
      clerkId,
      name,
      username: clerkId,
      email: `${clerkId}@example.com`,
      imageUrl: "",
      createdAt: Date.now(),
    })
  );

const setup = async () => {
  const t = convexTest(schema);
  await seedUser(t, "alice", "Alice");
  await seedUser(t, "bob", "Bob");
  const asAlice = t.withIdentity({ subject: "alice" });
  const asBob = t.withIdentity({ subject: "bob" });
  const postId = await asAlice.mutation(api.posts.createPost, { text: "post" });
  return { t, asAlice, asBob, postId };
};

describe("comments.addComment", () => {
  it("throws when not authenticated", async () => {
    const { t, postId } = await setup();
    await expect(
      t.mutation(api.comments.addComment, { postId, text: "hi" })
    ).rejects.toThrow(/not authenticated/i);
  });

  it("creates a top-level comment", async () => {
    const { asBob, postId, t } = await setup();
    await asBob.mutation(api.comments.addComment, { postId, text: "great post" });

    const threaded = await t.query(api.comments.getComments, { postId });
    expect(threaded).toHaveLength(1);
    expect(threaded[0].text).toBe("great post");
    expect(threaded[0].userName).toBe("Bob");
    expect(threaded[0].replies).toEqual([]);
  });

  it("attaches a reply to its top-level parent", async () => {
    const { asAlice, asBob, postId, t } = await setup();
    const parentId = await asBob.mutation(api.comments.addComment, {
      postId,
      text: "great post",
    });
    await asAlice.mutation(api.comments.addComment, {
      postId,
      text: "thanks!",
      parentCommentId: parentId,
    });

    const threaded = await t.query(api.comments.getComments, { postId });
    expect(threaded).toHaveLength(1);
    expect(threaded[0].replies).toHaveLength(1);
    expect(threaded[0].replies?.[0].text).toBe("thanks!");
  });

  it("caps nesting at 1 level: a reply to a reply is re-parented to the top-level", async () => {
    const { asAlice, asBob, postId, t } = await setup();
    const top = await asBob.mutation(api.comments.addComment, {
      postId,
      text: "top-level",
    });
    const reply = await asAlice.mutation(api.comments.addComment, {
      postId,
      text: "reply",
      parentCommentId: top,
    });
    await asBob.mutation(api.comments.addComment, {
      postId,
      text: "reply to reply",
      parentCommentId: reply,
    });

    const threaded = await t.query(api.comments.getComments, { postId });
    expect(threaded).toHaveLength(1);
    expect(threaded[0].replies?.map((r) => r.text)).toEqual(["reply", "reply to reply"]);
  });
});

describe("comments.editComment", () => {
  it("throws when caller is not the comment owner", async () => {
    const { asAlice, asBob, postId } = await setup();
    const commentId = await asBob.mutation(api.comments.addComment, {
      postId,
      text: "bob's comment",
    });
    await expect(
      asAlice.mutation(api.comments.editComment, { commentId, text: "hijacked" })
    ).rejects.toThrow(/not your comment/i);
  });

  it("updates text and sets editedAt for the owner", async () => {
    const { asBob, postId, t } = await setup();
    const commentId = await asBob.mutation(api.comments.addComment, {
      postId,
      text: "before",
    });

    const before = await t.query(api.comments.getComments, { postId });
    expect(before[0].editedAt).toBeUndefined();

    await asBob.mutation(api.comments.editComment, { commentId, text: "after" });

    const after = await t.query(api.comments.getComments, { postId });
    expect(after[0].text).toBe("after");
    expect(typeof after[0].editedAt).toBe("number");
  });

  it("rejects empty text", async () => {
    const { asBob, postId } = await setup();
    const commentId = await asBob.mutation(api.comments.addComment, {
      postId,
      text: "x",
    });
    await expect(
      asBob.mutation(api.comments.editComment, { commentId, text: "   " })
    ).rejects.toThrow(/empty/i);
  });
});

describe("comments.deleteComment", () => {
  it("cascades to replies", async () => {
    const { asAlice, asBob, postId, t } = await setup();
    const top = await asBob.mutation(api.comments.addComment, { postId, text: "top" });
    await asAlice.mutation(api.comments.addComment, {
      postId,
      text: "reply",
      parentCommentId: top,
    });

    await asBob.mutation(api.comments.deleteComment, { commentId: top });

    const threaded = await t.query(api.comments.getComments, { postId });
    expect(threaded).toHaveLength(0);
  });
});
