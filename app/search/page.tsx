"use client";
import { api} from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import FeedTabs from "@/components/FeedTabs";
import PostCard from "@/components/PostCard";
import UserCard from "@/components/UserCard";
import { useQuery } from "convex/react";
import { useState } from "react";
export default function SearchPage(){
  const [searchTerm,setSearchTerm]=useState("");
  const [activeTab,setActiveTab]=useState<"posts" | "users">("posts");
  const posts=useQuery(api.posts.searchPosts,searchTerm.trim() ? {searchTerm} : "skip");
  const users=useQuery(api.users.searchUsers,searchTerm.trim() ? {searchTerm} : "skip");
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <input type="text" placeholder="Search posts or users" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full border rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
        </div>
       <div className="flex border-b mb-4 bg-white rounded-t-xl">
        <button onClick={()=>setActiveTab("posts")} className={`flex-1 py-3 text-center font-medium transistion ${
          activeTab === "posts" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
        }`}>Posts</button>
        <button onClick={()=>setActiveTab("users")} className={`flex-1 py-3 text-center font-medium transistion ${
          activeTab === "users" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
        }`}>Users</button>
       </div>
       {
        !searchTerm.trim() ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">Start typing to search</p>
          </div>
        ) : activeTab === "posts" ? (
          <div className="space-y-4">
            {
              posts === undefined ? (
                <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
              ): posts.length === 0 ? (
                <div className="text-center py-8 bg-wwhite rounded-xl shadow-sm">
                  <p className="text-gray-500">No posts found</p>
                </div>
              ):(
                posts.map((post)=><PostCard key={post._id} post={post}/>)
              )
            }

          </div>
        ):(
          <div className="space-y-4">
            {
              users === undefined ? (
                <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
              ): users.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl shadow-sm">
                <p className="text-gray-500">No people found</p>
              </div>
              ):(
                users.map((user)=><UserCard key={user._id} user={user}/>)
              )
            }

          </div>
        )
       }
      </main>

    </div>
  )

}