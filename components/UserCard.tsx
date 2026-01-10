import React from 'react'
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';
import FollowButton from './FollowButton';
interface UserCardProps{
  _id:Id<"users">,
  name:string,
  username:string,
  imageUrl:string,
  bio?:string,
  location?:string,
  website?:string,
  skills?:string[],
  createdAt:number,
}
const UserCard = ({user}:{user:UserCardProps}) => {
  const userId=user._id;
  if(!userId){
    return null;
  }

  return (
    <div className='bg-white rounded-xl shadow-sm p-4 flex items-center gap-4'>
    <Link href={`/profile/${userId}`}>
    <img src={user.imageUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover hover:opacity-80 transition" />
    
    </Link>
    <div className='flex-1 min-w-0'>
      <Link href={`/profile/${userId}`}>
      <h3 className="font-semibold text-gray-800 hover:underline truncate">{user.name}</h3>
      </Link>
      <p className='text-sm text-gray-500 truncate'>@{user.username}</p>
      {user.bio && <p className='text-sm text-gray-600 mt-1 line-clamp-2'>{user.bio}</p>}

    </div>
    <FollowButton targetUserId={userId}/>
    </div>
  )
}

export default UserCard
