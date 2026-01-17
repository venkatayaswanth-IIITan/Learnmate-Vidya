'use client';

import { useState, useEffect } from 'react';
import { getUserGroups } from '../utils/groups';

export default function UserGroups({ onSelectGroup, activeGroupId, isDarkMode = false, asCards = true, maxGroups }) {
  const [userGroups, setUserGroups] = useState([]);
  const [bookmarkedGroups, setBookmarkedGroups] = useState([]);

  useEffect(() => {
    const unsubscribe = getUserGroups(setUserGroups);
    return () => unsubscribe();
  }, []);

  const toggleBookmark = (groupId) => {
    setBookmarkedGroups((prev) =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const displayedGroups = maxGroups ? userGroups.slice(0, maxGroups) : userGroups;

  // Sample data for demonstration - replace with actual data
  const sampleGroups = [
    {
      id: '1',
      name: 'Random Variable',
      category: 'Mathematics',
      progress: 0,
      totalLessons: 20,
      membersCount: 1
    },
    {
      id: '2',
      name: 'Testing2',
      category: 'Computer Science',
      progress: 0,
      totalLessons: 20,
      membersCount: 1
    },
    {
      id: '3',
      name: 'Creative Writing for Beginners',
      category: 'English',
      progress: 5,
      totalLessons: 20,
      membersCount: 120
    },
    {
      id: '4',
      name: 'Digital Illustration with Adobe Illustrator',
      category: 'Computer Science',
      progress: 12,
      totalLessons: 50,
      membersCount: 80
    }
  ];

  const getColorByCategory = (category) => {
    if (isDarkMode) {
      return 'bg-slate-800 border-slate-700 shadow-lg shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-900/50 hover:-translate-y-1';
    }
    return 'bg-white border-slate-100 shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:shadow-indigo-200/50 hover:-translate-y-1';
  };

  const isBookmarked = (groupId) => bookmarkedGroups.includes(groupId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {sampleGroups.length === 0 ? (
        <div className="col-span-4 text-center py-10">
          <p className="text-white text-lg">You haven't joined any groups yet</p>
          <p className="text-white text-sm mt-2">Create a new group to get started</p>
        </div>
      ) : (
        sampleGroups.map((group) => (
          <div
            key={group.id}
            onClick={() => onSelectGroup && onSelectGroup(group)}
            className={`rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 border ${getColorByCategory(group.category)}`}
          >
            {/* Category tag */}
            <div className="px-5 pt-5 pb-2 flex justify-between items-center">
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${isDarkMode ? "bg-indigo-900/50 text-indigo-300" : "bg-indigo-50 text-indigo-500"
                }`}>{group.category}</span>
              <button
                className={`text-slate-400 hover:text-red-500 transition-colors ${isBookmarked(group.id) ? 'fill-red-500 text-red-500' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(group.id);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isBookmarked(group.id) ? 0 : 2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>

            {/* Group title */}
            <div className="px-5 py-2">
              <h3 className={`text-lg font-bold leading-tight transition-colors ${isDarkMode ? "text-white group-hover:text-indigo-400" : "text-slate-800 group-hover:text-indigo-600"
                }`}>{group.name}</h3>
            </div>



            <div className="px-5 pb-5 flex">
              <button className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 ${isDarkMode
                ? "bg-indigo-600 text-white shadow-indigo-900/50 hover:bg-indigo-500"
                : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
                }`}>
                Continue Learning
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}