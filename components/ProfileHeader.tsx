"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FollowButton from "./FollowButton";

interface Props {
  userId: Id<"users">;
}

export default function ProfileHeader({ userId }: Props) {
  const user = useQuery(api.users.getUser, { userId });
  const stats = useQuery(api.users.getUserStats, { userId });

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="h-32 sm:h-40 animate-shimmer" />
        <div className="px-6 pb-6">
          <div className="h-24 w-24 -mt-12 rounded-full animate-shimmer" />
          <div className="h-6 w-1/3 rounded-md animate-shimmer mt-4" />
          <div className="h-4 w-1/4 rounded-md animate-shimmer mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="h-32 sm:h-40 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
      </div>

      <div className="px-4 sm:px-6 pb-6 relative">
        <div className="flex items-start justify-between -mt-12 sm:-mt-14 mb-4 gap-3">
          <img
            src={user.imageUrl}
            alt={user.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-card shadow-lg bg-card"
          />
          <div className="mt-12 sm:mt-14">
            <FollowButton targetUserId={userId} />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">{user.name}</h1>
        <p className="text-muted-foreground">@{user.username}</p>

        {user.bio && (
          <p className="mt-3 text-foreground/80 leading-relaxed text-[15px]">{user.bio}</p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-sm text-muted-foreground">
          {user.location && (
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {user.location}
            </span>
          )}
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {user.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        {user.skills && user.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {user.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
          <Stat value={stats?.postsCount} label="Posts" />
          <Stat value={stats?.followersCount} label="Followers" />
          <Stat value={stats?.followingCount} label="Following" />
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number | undefined; label: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold tracking-tight text-foreground">{value ?? 0}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}
