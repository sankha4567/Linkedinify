"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import CommentSection from "../../../components/CommentSection";
import toast from "react-hot-toast";
export default function PostPage(){
  const {user}=useUser();
  const params=useParams();
  const postId=params.postId as Id<"posts">;
  const post=useQuery(api.posts.getPost,{postId});
  const currentUser=useQuery(api.users.getCurrentUser,user ? {clerkId:user.id}:"skip");
  const deletePost=useMutation(api.posts.deletePost);
  const router=useRouter();
  async function handleDelete(){
    if(!user || !post) return;
    try{
      await deletePost({postId,clerkId:user.id});
      toast.success("Post deleted successfully");
    }
    catch(error){
      toast.error("Failed to delete post. Please try again.");
    }
  }
  if(post === undefined){
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
  if(post === null){
     return (
      <div className="min-h-screen bg-gray-50">
        <Navbar/>
        <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-gray-500">Post not found</p>
        </div>
        </div>
      </div>
     )
  }
  const isAuthor=currentUser?._id === post?.userId;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <main className="max-w-2xl mx-auto px-4 py-6">
       <button onClick={()=>router.back()}
         className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">← Back</button>
         <PostCard post={post}/>
         {isAuthor && (
          <div className="mt-4 text-right">
            <button onClick={handleDelete}  className="text-red-500 hover:text-red-600 text-sm font-medium">Delete</button>

          </div>
         )}
         <CommentSection postId={postId}/>
      </main>

    </div>
  )
  
}