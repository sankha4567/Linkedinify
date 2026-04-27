"use client";
import Navbar from "@/components/Navbar";
import { useUser, useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import PostCard from "@/components/PostCard";
import PostForm from "@/components/PostForm";
import FeedTabs from "@/components/FeedTabs";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

  useEffect(() => {
    // Wait for Convex to confirm the auth token is valid before mutating —
    // useUser() can briefly report a user during sign-out transitions while
    // the Convex JWT is already gone, which produces "Not authenticated" noise.
    if (!isAuthenticated || !user) return;
    createOrUpdateUser({
      name: user.fullName || user.firstName || user.lastName || "Anonymous",
      email: user.primaryEmailAddress?.emailAddress || "",
      imageUrl: user.imageUrl || "",
    }).catch(() => {});
  }, [isAuthenticated, user, createOrUpdateUser]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
  }, [isLoaded, isSignedIn, router]);

  const forYouPosts = useQuery(api.posts.getFeedPosts);
  const followingPosts = useQuery(
    api.posts.getFollowingFeed,
    user && activeTab === "following" ? {} : "skip"
  );
  const posts = activeTab === "forYou" ? forYouPosts : followingPosts;

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <PostForm />
        <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="space-y-4">
          {posts === undefined ? (
            <FeedSkeleton />
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-2xl">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-foreground font-medium">
                {activeTab === "following" ? "Your following feed is empty" : "No posts yet"}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {activeTab === "following"
                  ? "Follow some people to see their posts here"
                  : "Be the first to share something with the community"}
              </p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </div>
      </main>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <>
      {[0, 1].map((i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full animate-shimmer" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/3 rounded animate-shimmer" />
              <div className="h-3 w-1/4 rounded animate-shimmer" />
            </div>
          </div>
          <div className="h-4 w-full rounded animate-shimmer" />
          <div className="h-4 w-5/6 rounded animate-shimmer" />
        </div>
      ))}
    </>
  );
}
