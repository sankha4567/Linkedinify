"use client";
import {useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FollowButton from "./FollowButton";
interface Props{
  userId:Id<"users">,
}
export default function ProfileHeader({userId}:Props){
  const user=useQuery(api.users.getUser,{userId});
  const stats=useQuery(api.users.getUserStats,{userId});
  if(!user){
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto"></div>
        <div className="h-6 bg-gray-200 rounded mt-4 w-1/3 mx-auto"></div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
       <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500"></div>
       <div className="px-6 pb-6">
        <div className="flex justify-between items-end -mt-12 mb-4">
          <img src={user.imageUrl} alt={user.name}  className="w-24 h-24 rounded-full border-4 border-white shadow-md"/>
          <FollowButton targetUserId={userId}/>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
        <p className="text-gray-500">@{user.username}</p>
        {user.bio && <p className="mt-3 text-gray-700">{user.bio}</p>}
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
        {user.location && <span>📍 {user.location}</span>}
        {user.website && (
          <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">🌐 {user.website}</a>
        )}
        </div>
        {
          user.skills && user.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {
                user.skills.map((skill)=>(
                  <span key={skill} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
                ))
              }
            </div>
          )
        }
       <div className="flex gap-6 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="font-bold text-gray-800">{stats?.postsCount || 0}</div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-800">{stats?.followersCount || 0}</div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-800">{stats?.followingCount || 0}</div>
            <div className="text-sm text-gray-500">Following</div>
          </div>
        </div>
       </div>
    </div>
  )
}