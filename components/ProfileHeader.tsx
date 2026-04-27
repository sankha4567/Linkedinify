"use client";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FollowButton from "./FollowButton";

interface Props {
  userId: Id<"users">;
}

export default function ProfileHeader({ userId }: Props) {
  const { user: clerkUser } = useUser();
  const user = useQuery(api.users.getUser, { userId });
  const stats = useQuery(api.users.getUserStats, { userId });
  const currentUser = useQuery(api.users.getCurrentUser, clerkUser ? {} : "skip");
  const isOwnProfile = currentUser?._id === userId;

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
        <div className="h-40 sm:h-48 animate-shimmer" />
        <div className="px-6 pb-6">
          <div className="h-28 w-28 -mt-14 rounded-full animate-shimmer" />
          <div className="h-7 w-1/3 rounded animate-shimmer mt-4" />
          <div className="h-4 w-1/4 rounded animate-shimmer mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
      {/* Banner */}
      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.3),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.15),transparent_60%)]" />

        {/* Action button — top right of banner */}
        <div className="absolute top-4 right-4">
          {isOwnProfile ? (
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-semibold bg-white/15 text-white border border-white/30 backdrop-blur-md hover:bg-white/25 active:scale-95 transition shadow-lg"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </Link>
          ) : (
            <FollowButton targetUserId={userId} />
          )}
        </div>
      </div>

      <div className="px-5 sm:px-7 pb-6">
        {/* Avatar — overlaps banner */}
        <div className="-mt-16 sm:-mt-20 mb-4">
          <div className="relative inline-block">
            <img
              src={user.imageUrl}
              alt={user.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-card shadow-xl bg-card"
            />
            {isOwnProfile && (
              <Link
                href="/profile/edit"
                aria-label="Change profile photo"
                className="absolute bottom-1 right-1 h-9 w-9 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-card shadow-md hover:opacity-90 active:scale-95 transition"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Name + handle */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{user.name}</h1>
          <span className="text-muted-foreground">@{user.username}</span>
        </div>

        {user.bio && (
          <p className="mt-3 text-foreground/85 leading-relaxed text-[15px] max-w-prose">{user.bio}</p>
        )}

        {/* Inline meta */}
        {(user.location || user.website) && (
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-muted-foreground">
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
        )}

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {user.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-md transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Stats — refined card-style row */}
        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 p-1 bg-muted/50 border border-border rounded-2xl">
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
    <div className="text-center py-2 rounded-xl hover:bg-card transition-colors">
      <div className="text-xl font-bold tracking-tight text-foreground tabular-nums">{value ?? 0}</div>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}
