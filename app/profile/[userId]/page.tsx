"use client";
import {useQuery} from "convex/react";
import { api} from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {useParams} from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfileHeader from "@/components/ProfileHeader";
import PostCard from "@/components/PostCard";
export default function ProfilePage(){
  const params=useParams();
  const userId=params.userId as Id<"users">;
  const user=useQuery(api.users.getUser,{userId});
  const posts=useQuery(api.posts.getUserPosts,{userId});
  if(!user){
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="animate-pulse">
        <div className="bg-gray-200 h-48 rounded-xl"></div>
        </div>
       </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <ProfileHeader userId={userId}/>
          <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Posts</h2>
          <div className="space-y-4">
             {
              posts === undefined ? (
                <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
              ): posts.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-500">No posts yet</p>
                  </div>
              ):(
                posts.map((post)=><PostCard key={post._id} post={post}/>)
              )
             }
          </div>
        </main>

    </div>
  )

}