import {UserButton,useUser} from "@clerk/nextjs";
import {useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import Link from "next/link";
export default function Navbar(){
  const {user}=useUser();
  const currentUser=useQuery(api.users.getCurrentUser,user ? {clerkId:user.id} : "skip");
  return (
     <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
        TechConnect
        </Link>
        <div className="flex items-center gap-6">
        <Link
            href="/"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Home
          </Link>
          <Link
            href="/search"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Search
          </Link>
          <Link
            href="/create"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition"
          >
            + Post
          </Link>
         {
          currentUser && (
            <Link href={`/profile/${currentUser._id}`} className="text-gray-600 hover:text-blue-600 transition">
             Profile;
            </Link>
          )
         }
         <UserButton afterSignOutUrl="/" />
        </div>

      </div>

     </nav>
  )
}