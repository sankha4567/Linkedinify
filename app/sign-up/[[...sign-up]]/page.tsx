"use client";
import {SignUp} from "@clerk/nextjs";
export default function SignInPage(){
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp 
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        redirectUrl="/"
        afterSignInUrl="/"
      />
    </div>
  )
}