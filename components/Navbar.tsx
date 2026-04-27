"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const currentUser = useQuery(api.users.getCurrentUser, user ? {} : "skip");

  const navLink = (href: string, label: string) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`relative text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
          active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        {label}
        {active && (
          <span className="absolute left-3 right-3 -bottom-px h-0.5 rounded-full bg-primary" />
        )}
      </Link>
    );
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            TechConnect
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          {navLink("/", "Home")}
          {navLink("/search", "Search")}
          {currentUser && navLink(`/profile/${currentUser._id}`, "Profile")}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/create"
            className="hidden sm:inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 h-9 rounded-full text-sm font-medium hover:opacity-90 active:scale-95 transition shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Post
          </Link>
          <ThemeToggle />
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-2 ring-border hover:ring-primary/40 transition-all",
                userButtonPopoverCard: "bg-card border border-border shadow-lg",
                userButtonPopoverActionButton: "text-foreground hover:bg-muted",
                userButtonPopoverActionButtonText: "text-foreground",
                userButtonPopoverFooter: "hidden",
              },
            }}
          />
        </div>
      </div>

      <div className="sm:hidden border-t border-border bg-background/80">
        <div className="max-w-6xl mx-auto px-2 py-1.5 flex items-center justify-around">
          {navLink("/", "Home")}
          {navLink("/search", "Search")}
          <Link
            href="/create"
            className="text-sm font-medium px-3 py-2 rounded-lg text-primary hover:bg-muted"
          >
            + Post
          </Link>
          {currentUser && navLink(`/profile/${currentUser._id}`, "Profile")}
        </div>
      </div>
    </nav>
  );
}
