"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfileHeader from "@/components/ProfileHeader";
import PostCard from "@/components/PostCard";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as Id<"users">;
  const user = useQuery(api.users.getUser, { userId });
  const posts = useQuery(api.posts.getUserPosts, { userId });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <ProfileHeader userId={userId} />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Posts {posts && <span className="text-muted-foreground font-normal">({posts.length})</span>}
            </h2>
          </div>

          <div className="space-y-4">
            {!user || posts === undefined ? (
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div className="h-4 w-1/3 rounded animate-shimmer" />
                <div className="h-3 w-2/3 rounded animate-shimmer" />
                <div className="h-32 w-full rounded-xl animate-shimmer" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-2xl">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            ) : (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
