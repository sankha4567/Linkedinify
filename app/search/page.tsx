"use client";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import UserCard from "@/components/UserCard";
import { useQuery } from "convex/react";
import { useState } from "react";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
  const posts = useQuery(api.posts.searchPosts, searchTerm.trim() ? { searchTerm } : "skip");
  const users = useQuery(api.users.searchUsers, searchTerm.trim() ? { searchTerm } : "skip");

  const tab = (key: "posts" | "users", label: string) => {
    const active = activeTab === key;
    return (
      <button
        onClick={() => setActiveTab(key)}
        className={`flex-1 h-9 rounded-md text-sm font-medium transition-all duration-200 ${
          active
            ? "bg-card text-primary shadow-sm ring-1 ring-border"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search posts, people, tags…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-full h-12 pl-12 pr-4 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-transparent shadow-sm transition"
            autoFocus
          />
        </div>

        <div className="bg-muted border border-border rounded-lg p-1 flex items-center">
          {tab("posts", "Posts")}
          {tab("users", "People")}
        </div>

        {!searchTerm.trim() ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-foreground font-medium">Search the community</p>
            <p className="text-muted-foreground text-sm mt-1">Find posts, tags, or people to follow</p>
          </div>
        ) : activeTab === "posts" ? (
          <div className="space-y-4">
            {posts === undefined ? (
              <SearchSkeleton />
            ) : posts.length === 0 ? (
              <EmptyResult message="No posts found" />
            ) : (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {users === undefined ? (
              <SearchSkeleton />
            ) : users.length === 0 ? (
              <EmptyResult message="No people found" />
            ) : (
              users.map((u) => <UserCard key={u._id} user={u} />)
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full animate-shimmer" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-1/3 rounded animate-shimmer" />
          <div className="h-3 w-1/5 rounded animate-shimmer" />
        </div>
      </div>
      <div className="h-4 w-full rounded animate-shimmer" />
    </div>
  );
}

function EmptyResult({ message }: { message: string }) {
  return (
    <div className="text-center py-12 bg-card border border-border rounded-2xl">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
