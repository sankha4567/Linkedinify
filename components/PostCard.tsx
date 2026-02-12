import React from 'react';
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';
import LikeButton from '@/components/LikeButton';
import { getTimeAgo } from '@/lib/utils';
 interface PostCardProps {
   _id:Id<"posts">,
   userId:Id<"users">,
   text:string,
   imageUrl?:string,
   tags?:string[],
   createdAt:number,
   authorName:string,
   authorUsername:string,
   authorImage:string,
   likesCount:number,
   commentsCount:number,


 }

const PostCard = ({post}:{post:PostCardProps}) => {
  const timeAgo=getTimeAgo(post.createdAt)
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
      <div className="flex gap-3 mb-3">
        <Link href={`/profile/${post.userId}`}>
        <img src={post.authorImage} alt={post.authorName} className="w-10 h-10  hover:opacity-80 transition" />
        </Link>
        <div className='flex-1'>
           <Link href={`/profile/${post.userId}`}>
           <span className="font-semibold text-gray-800 hover:underline">{post.authorName}</span>
          </Link>
          <p className='text-sm text-gray-500'>@{post.authorUsername} . {timeAgo}</p>
        </div>

      </div>
      <Link href={`/post/${post._id}`}>
      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.text}</p>
      </Link>
      {
        post.imageUrl && (
          <Link href={`/post/${post._id}`}>
            <img src={post.imageUrl} alt="Post Image" className="w-full max-h-96 object-cover hover:opacity-95 transition" />
           </Link>
        )
      }
      {
        post.tags && post.tags.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-3'>
            {
            post.tags.map((tag,index)=><span key={index} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">#{tag}</span>)
          }
            </div>
        )
      }
      <div className='flex items-center gap-6 pt-3 border-t'>
        <LikeButton postId={post._id} initialCount={post.likesCount}/>
        <Link href={`/post/${post._id}`} className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm">{post.commentsCount}</span>
        </Link>
      </div>
    </div>
  )
}

export default PostCard;
