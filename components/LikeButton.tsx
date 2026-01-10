"use client";
import React from 'react'
import { useUser} from '@clerk/nextjs';
import {useMutation,useQuery} from 'convex/react';
import {api} from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useState } from 'react';
interface Props{
  postId:Id<"posts">,
  initialCount:number,
}
const LikeButton = ({postId,initialCount}:Props) => {
  const {user}=useUser();
  const [isLiking,setIsLiking]=useState(false);
 
  const hasLiked=useQuery(api.likes.hasLiked,
   user ? {postId,clerkId:user.id}:"skip");

   const toggleLike=useMutation(api.likes.toggleLike);
   const handleLike=async()=>{
    if(!user || isLiking){
      return;
    }
    setIsLiking(true);
    try{
      await toggleLike({postId,clerkId:user.id});

    }
    catch(err){
      console.error("Error liking post:", err);
      alert("Failed to like post. Please try again.");
    }finally{
      setIsLiking(false);
    }
   }
  return (
   <button onClick={handleLike} disabled={isLiking || !user} className={`flex items-center gap-2 transition ${hasLiked ? "text-blue-500" : "text-gray-500 hover:text-blue-500"}`}>
    <svg className="w-5 h-5" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span className="text-sm">{initialCount}</span>

   </button>
  )
}

export default LikeButton
