"use client";
import React from 'react'

const FeedTabs = ({
  activeTab,
  setActiveTab,
}:{
  activeTab: "forYou" | "following";
  setActiveTab: (tab: "forYou" | "following") => void;
}) => {
  return (
    <div className='flex border-b mb-4 bg-white rounded-xl shadow-sm'>
      <button onClick={()=>setActiveTab("forYou")} className={`flex-1 py-3 text-center font-medium transistion ${
      activeTab === "forYou" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
        }`}>For You</button>
      <button onClick={()=>setActiveTab("following")} className={`flex-1 py-3 text-center font-medium transistion ${
      activeTab === "following" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
        }`}>Following</button>
      
    </div>
  )
}

export default FeedTabs
