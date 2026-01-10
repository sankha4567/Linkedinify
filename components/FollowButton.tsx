"use client";
import React from 'react'
import { useUser } from '@clerk/nextjs';
import {useMutation,useQuery} from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useState } from 'react';
interface Props{
  targetUserId:Id<"users">,
}
export default function FollowButton({targetUserId}:Props){
  const {user}=useUser();
  const [isLoading,setIsLoading]=useState(false);
  const isFollowing=useQuery(api.follows.isFollowing,user ? {targetUserId,clerkId:user.id}:"skip");
  const currentUser=useQuery(api.users.getCurrentUser,user ? {clerkId:user.id}:"skip");
  const toggleFollow=useMutation(api.follows.toggleFollow);
  if(currentUser?._id ===targetUserId){
    return null;
  }
  async function handleFollow(){
    if(!user || isLoading)return;
    setIsLoading(true);
    try{
      await toggleFollow({targetUserId,clerkId:user.id});
    }
    catch(error){
      console.error("Error toggling follow:",error);
      alert("Failed to follow user. Please try again.");
    }
    finally{
      setIsLoading(false);
    }
  }
  return (
    <button disabled={isLoading || !user} onClick={handleFollow}  className={`px-6 py-2 rounded-full font-medium transition ${
      isFollowing ? "bg-gray-200 text-gray-800 hover:bg-red-100 hover:text-red-600" : "bg-blue-500 text-white hover:bg-blue-600"
    }`}>
     {isLoading ? "..." : isFollowing ? "Following" :"Follow"}
    </button>
  )


}