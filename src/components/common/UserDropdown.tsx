"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export function UserDropdown() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return <span className="auth-loading">Checking auth...</span>;
  }

  if (!session?.user) {
    return (
      <button className="auth-btn login-btn" onClick={() => signIn()}>
        Login
      </button>
    );
  }

  return (
    <div className="dropdown-wrapper" ref={dropdownRef}>
      <button 
        className={`dropdown-toggle ${isMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="user-initial">
          {(session.user.name || session.user.email || "?")[0].toUpperCase()}
        </span>
        <span className="user-name">
          {session.user.name ?? session.user.email?.split('@')[0]}
        </span>
        <svg 
          className={`chevron-icon ${isMenuOpen ? 'rotated' : ''}`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="dropdown-menu">
          <div className="menu-header">
            <div className="menu-user-info">
              <p className="menu-name">{session.user.name}</p>
              <p className="menu-email">{session.user.email}</p>
            </div>
          </div>
          <div className="menu-divider" />
          <button className="menu-item" onClick={() => setIsMenuOpen(false)}>
            Profile
          </button>
          <button className="menu-item" onClick={() => setIsMenuOpen(false)}>
            Settings
          </button>
          <div className="menu-divider" />
          <button 
            className="menu-item logout" 
            onClick={() => {
              setIsMenuOpen(false);
              signOut();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
