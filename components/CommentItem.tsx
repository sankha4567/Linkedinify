import React from 'react';
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';
import { getTimeAgo } from '@/lib/utils';

interface CommentItemProps{
  userName: string;
  userUsername: string;
  userImage: string;
  _id: Id<"comments">;
  _creationTime: number;
  postId: Id<"posts">;
  createdAt: number;
  userId: Id<"users">;
  text: string;
}
const CommentItem = ({comment}:{comment:CommentItemProps}) => {
  const timeAgo=getTimeAgo(comment.createdAt);
  return (
    <div className='flex gap-3'>
      <Link href={`/profile/${comment.userId}`}>
      <img src={comment.userImage} alt={comment.userName} className='w-8 h-8 rounded-full object-cover hover:opacity-80 transition' />
      </Link>
      <div className='flex-1'>
        <div className='bg-gray-50 rounded-lg px-3 py-2'>
         <div className='flex items-center gap-2'>
           <Link href={`/profile/${comment.userId}`}>
           <span className="font-medium text-gray-800 text-sm hover:underline">{comment.userName}</span>
           </Link>
           <span className="text-xs text-gray-400">{timeAgo}</span>
         </div>
         <p className='text-gray-700 text-sm mt-1'>{comment.text}</p>
        </div>
      </div>
      
    </div>
  )
}

export default CommentItem
