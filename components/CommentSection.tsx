"use client";
import React from 'react'
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import {useQuery,useMutation} from 'convex/react';
import { api } from '@/convex/_generated/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import CommentItem from './CommentItem';
const CommentSection = ({postId}:{postId:Id<"posts">}) => {
  const {user}=useUser();
  const [text,setText]=useState("");
  const [isSubmitting,setIsSubmitting]=useState(false);
  const comments=useQuery(api.comments.getComments,{postId});
  const addComment=useMutation(api.comments.addComment);
  const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(!user || !text.trim()){
      return;
    }
    setIsSubmitting(true);
    try{
      await addComment({clerkId:user.id,text:text.trim(),postId});
      toast.success("Comment added successfully");
      setText("");
    }
    catch(err){
      toast.error("Failed to create a comment. Please try again.");
    }
    finally{
      setIsSubmitting(false);
    }
  }
  return (
    <div className='bg-white rounded-xl shadow-sm p-4 mt-4'>
      <h3 className='text-lg font-medium text-gray-800 mb-4'>Comments:{comments?.length || 0}</h3>
      <form className='flex gap-3 mb-4' onSubmit={handleSubmit}>
        <img src={user?.imageUrl} alt="Avatar image" className='w-8 h-8 rounded-full'/>
        <input type="text" value={text} onChange={(e)=>setText(e.target.value)} placeholder='Add a comment....'
         className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
         <button type="submit" disabled={isSubmitting || text.trim().length === 0}  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition disabled:opacity-50"
        > {isSubmitting ? "..." : "Post"}</button>

      </form>
     {/* commentlist show */}
     <div className='space-y-4'>
      {
        comments === undefined ? (
          <p className="text-gray-500 text-center py-4">Loading comments...</p>
        ): comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ):(
          comments.map((comment)=><CommentItem key={comment._id} comment={comment}/>)
        )
      }

     </div>
    </div>
  )
}

export default CommentSection
