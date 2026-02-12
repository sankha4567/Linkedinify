"use client";
import Navbar from "@/components/Navbar";
import { useUser,useAuth } from "@clerk/nextjs";
import {useQuery,useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import {useState,useEffect} from "react";
import PostCard from "@/components/PostCard";
import PostForm from "@/components/PostForm";
import FeedTabs from "@/components/FeedTabs";
import { useRouter } from "next/navigation";
export default function Home() {
  const {user,isLoaded}=useUser();
  const {isSignedIn}=useAuth();
  const router=useRouter();
  const [activeTab,setActiveTab]=useState<"forYou" | "following">("forYou");
  const createOrUpdateUser=useMutation(api.users.createOrUpdateUser);
  useEffect(()=>{
    if(user && isLoaded){
      createOrUpdateUser({
        clerkId:user.id,
        name:user.fullName || user.firstName || user.lastName || "Anonmyous",
        email:user.primaryEmailAddress?.emailAddress || "",
        imageUrl:user.imageUrl || "",
      });
    }
  }, [user, isLoaded, createOrUpdateUser]);
  useEffect(()=>{
    if(isLoaded && !isSignedIn){
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn]);
const forYouPosts=useQuery(api.posts.getFeedPosts);
const followingPosts=useQuery(api.posts.getFollowingFeed,user ? {clerkId:user.id} : "skip");
const posts=activeTab == "forYou" ? forYouPosts : followingPosts;
if(!isLoaded){
  return (
    <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
  )
}

// Show loading while redirecting
if (!isSignedIn) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}
  return (
    <div className="min-h-screen bg-gray-50">
      
        <Navbar />
     <main className="max-w-2xl mx-auto px-4 py-6">
      <PostForm />
       <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />
       <div className="space-y-4">
       {
        posts == undefined ? ( <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading posts...</p>
        </div>): posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">
              {activeTab === "following"
                ? "Follow some people to see their posts here!"
                : "No posts yet. Be the first to post!"}
            </p>
          </div>
        ):(
          posts.map((post)=><PostCard key={post._id} post={post}/>)
        )
       }
       </div>
      </main>
    </div>
  );
}
