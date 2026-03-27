"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <div className="header">
      <h1 className="logo" onClick={() => window.location.href = '/'}>JustType</h1>
      
      <div className="auth-header">
        {status === "loading" ? (
          <span className="auth-loading">Checking auth...</span>
        ) : session?.user ? (
          <>
            <span className="auth-user">
              Logged in as{" "}
              <span className="auth-user-name">
                {session.user.name ?? session.user.email}
              </span>
            </span>
            <button className="auth-btn" onClick={() => signOut()}>
              Logout
            </button>
          </>
        ) : (
          <button className="auth-btn" onClick={() => signIn()}>
            Login
          </button>
        )}
      </div>
    </div>
  );
}
