"use client";

import { UserDropdown } from "./UserDropdown";

export function Header() {
  return (
    <div className="header">
      <h1 className="logo" onClick={() => window.location.href = '/'}>JustType</h1>
      
      <div className="auth-dropdown-container">
        <UserDropdown />
      </div>
    </div>
  );
}
