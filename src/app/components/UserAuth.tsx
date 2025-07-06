"use client";

import { SignIn, SignUp, UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function UserAuth() {
  const { isSignedIn, user } = useUser();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Hide welcome message after 5 seconds when user is signed in
  useEffect(() => {
    if (isSignedIn && showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isSignedIn, showWelcome]);

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        {showWelcome && (
          <span className="text-white/80 text-sm animate-fade-in">
            Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
          </span>
        )}
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-8 h-8"
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center jus gap-2">
      <button
        onClick={() => setShowSignIn(true)}
        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Sign In
      </button>
      <button
        onClick={() => setShowSignUp(true)}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Sign Up
      </button>

      {showSignIn && (
        <div className="fixed inset-0 mt-96 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
            <SignIn routing="hash" />
            <button
              onClick={() => setShowSignIn(false)}
              className="mt-4 text-white/60 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showSignUp && (
        <div className="fixed inset-0 mt-96 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
            <SignUp routing="hash" />
            <button
              onClick={() => setShowSignUp(false)}
              className="mt-4 text-white/60 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 