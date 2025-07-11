import React from 'react';
import { AuthUser } from '../services/authService';

interface UserMenuProps {
  user: AuthUser;
  onClick: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onClick }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGravatarUrl = (email: string, size: number = 80) => {
    // Create a simple hash from email for consistent avatar
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const positiveHash = Math.abs(hash);
    return `https://api.dicebear.com/7.x/initials/svg?seed=${email}&backgroundColor=${(positiveHash % 16).toString(16)}${((positiveHash >> 4) % 16).toString(16)}${((positiveHash >> 8) % 16).toString(16)}&fontSize=40`;
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 p-1 rounded-full hover:bg-accent transition-colors"
      title="Open Profile"
    >
      <img
        src={user.avatar_url || getGravatarUrl(user.email)}
        alt={user.name || user.email}
        className="w-8 h-8 rounded-full border-2 border-primary/20"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <rect width="32" height="32" fill="hsl(var(--primary))" rx="16"/>
              <text x="16" y="20" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" fill="white">
                ${getInitials(user.name || user.email)}
              </text>
            </svg>
          `)}`;
        }}
      />
    </button>
  );
};