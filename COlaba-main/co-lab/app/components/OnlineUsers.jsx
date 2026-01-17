'use client';

import { useEffect, useState } from 'react';
import { getOnlineUsers } from '../utils/presence';

export default function OnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = getOnlineUsers((users) => {
      setOnlineUsers(users);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  return (
    <div className="bg-grey rounded-lg shadow-md p-2">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold flex items-center text-black">
          <span className="bg-green-100 text-green-600 p-1 rounded-md mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </span>
          Online Users 
          <span className="ml-2 text-sm bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
            {onlineUsers.length}
          </span>
        </h3>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      ) : isExpanded && (
        <>
          {onlineUsers.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-black text-sm">No users online</p>
              <p className="text-black text-xs mt-1">Users will appear here when they come online</p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {onlineUsers.map(user => (
                <li key={user.uid} className="flex items-center p-2 rounded-lg text-black hover:bg-gray-50 transition-colors">
                  <div className="relative">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName} 
                        className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-white shadow" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full mr-3 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white border-2 border-white shadow">
                        {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                  </div>
                  <div>
                    <span className="text-sm font-medium truncate block">
                      {user.displayName || user.email?.split('@')[0] || `User-${user.uid.substring(0, 5)}`}
                    </span>
                    {user.lastActive && (
                      <span className="text-xs text-gray-400">
                        Active {timeAgo(user.lastActive)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {onlineUsers.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-center text-gray-400">
              {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} currently online
            </div>
          )}
        </>
      )}
    </div>
  );
}

function timeAgo(timestamp) {
  if (!timestamp) return 'just now';
  
  const now = new Date();
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString();
}