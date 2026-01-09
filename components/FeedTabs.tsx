import React from 'react'

const FeedTabs = ({
  activeTab,
  setActiveTab,
}:{
  activeTab: "forYou" | "following";
  setActiveTab: (tab: "forYou" | "following") => void;
}) => {
  return (
    <div>
      FeedTabs
    </div>
  )
}

export default FeedTabs
