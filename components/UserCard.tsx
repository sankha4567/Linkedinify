import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import FollowButton from "./FollowButton";

interface UserCardProps {
  _id: Id<"users">;
  name: string;
  username: string;
  imageUrl: string;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  createdAt: number;
}

export default function UserCard({ user }: { user: UserCardProps }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-foreground/20 hover:shadow-md transition animate-fade-in">
      <Link href={`/profile/${user._id}`} className="flex-shrink-0">
        <img
          src={user.imageUrl || "/default-avatar.png"}
          alt={user.name}
          className="w-14 h-14 rounded-full object-cover ring-2 ring-border hover:ring-primary/40 transition"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user._id}`}>
          <h3 className="font-semibold text-foreground hover:underline truncate">{user.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
        {user.bio && (
          <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{user.bio}</p>
        )}
      </div>
      <FollowButton targetUserId={user._id} />
    </div>
  );
}
