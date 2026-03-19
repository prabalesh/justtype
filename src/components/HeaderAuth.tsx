"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function HeaderAuth() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="auth-header">
                <span className="auth-loading">Checking auth...</span>
            </div>
        );
    }

    return (
        <div className="auth-header">
            {session?.user ? (
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
    );
}
