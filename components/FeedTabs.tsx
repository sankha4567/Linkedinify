"use client";

const FeedTabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: "forYou" | "following";
  setActiveTab: (tab: "forYou" | "following") => void;
}) => {
  const tab = (key: "forYou" | "following", label: string) => {
    const active = activeTab === key;
    return (
      <button
        onClick={() => setActiveTab(key)}
        className={`relative flex-1 h-9 rounded-md text-sm font-medium transition-all duration-200 ${
          active
            ? "bg-card text-primary shadow-sm ring-1 ring-border"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="bg-muted border border-border rounded-lg p-1 flex items-center mb-4">
      {tab("forYou", "For You")}
      {tab("following", "Following")}
    </div>
  );
};

export default FeedTabs;
