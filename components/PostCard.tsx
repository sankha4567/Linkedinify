import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import LikeButton from "@/components/LikeButton";
import Markdown from "@/components/Markdown";
import { getTimeAgo } from "@/lib/utils";

interface PostCardProps {
  _id: Id<"posts">;
  userId: Id<"users">;
  text: string;
  imageUrl?: string;
  tags?: string[];
  createdAt: number;
  authorName: string;
  authorUsername: string;
  authorImage: string;
  likesCount: number;
  commentsCount: number;
}

export default function PostCard({ post }: { post: PostCardProps }) {
  const timeAgo = getTimeAgo(post.createdAt);
  return (
    <article className="bg-card border border-border rounded-2xl p-4 sm:p-5 hover:border-foreground/20 hover:shadow-md transition animate-fade-in">
      <div className="flex items-start gap-3 mb-3">
        <Link href={`/profile/${post.userId}`} className="flex-shrink-0">
          <img
            src={post.authorImage || "/default-avatar.png"}
            alt={post.authorName}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-border hover:ring-primary/40 transition"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href={`/profile/${post.userId}`} className="font-semibold text-foreground hover:underline truncate">
              {post.authorName}
            </Link>
            <span className="text-muted-foreground text-sm truncate">@{post.authorUsername}</span>
          </div>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>

      <Link href={`/post/${post._id}`} className="block mb-3">
        <Markdown>{post.text}</Markdown>
      </Link>

      {post.imageUrl && (
        <Link href={`/post/${post._id}`} className="block mb-3">
          <div className="rounded-xl overflow-hidden border border-border">
            <img
              src={post.imageUrl}
              alt="Post"
              className="w-full max-h-[28rem] object-cover hover:scale-[1.01] transition"
            />
          </div>
        </Link>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-md transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 pt-3 border-t border-border">
        <LikeButton postId={post._id} initialCount={post.likesCount} />
        <Link
          href={`/post/${post._id}`}
          className="flex items-center gap-2 px-3 h-9 rounded-full text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="font-medium">{post.commentsCount}</span>
        </Link>
      </div>
    </article>
  );
}
