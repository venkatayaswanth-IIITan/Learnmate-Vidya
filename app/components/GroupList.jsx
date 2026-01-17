'use client';
import { useState, useEffect } from 'react';
import { getAvailableGroups, joinGroup, createGroup } from '../utils/groups';
import { auth } from '../firebase';

export default function GroupList({ onSelectGroup }) {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [subject, setSubject] = useState('');
  const [experimentDetails, setExperimentDetails] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const unsubscribe = getAvailableGroups((groupsData) => {
        setGroups(groupsData);
        setIsLoading(false);
      }, (err) => {
        // Error callback for permission errors
        console.error('Error fetching groups:', err);
        setError(err);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up groups listener:', err);
      setError(err);
      setIsLoading(false);
    }
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !subject.trim()) return;

    setIsLoading(true);
    try {
      const groupId = await createGroup(newGroupName, subject, experimentDetails);
      if (groupId) {
        setNewGroupName('');
        setSubject('');
        setExperimentDetails('');
        setIsCreatingGroup(false);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGroups = searchQuery
    ? groups.filter(group =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.subject.toLowerCase().includes(searchQuery.toLowerCase()))
    : groups;

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-[5]">
        <h2 className="text-xl font-semibold">Available Groups</h2>
        <p className="text-sm text-blue-100 mt-1">Join or create research collaboration groups</p>
      </div>

      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {isCreatingGroup && (
        <div className="p-6 border-b border-gray-200 bg-gray-50 max-h-[300px] overflow-y-auto">
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
              <input
                id="groupName"
                type="text"
                placeholder="e.g., Quantum Computing Research"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                id="subject"
                type="text"
                placeholder="e.g., Quantum Algorithms"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="experimentDetails" className="block text-sm font-medium text-gray-700 mb-1">
                Experiment Details <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <textarea
                id="experimentDetails"
                placeholder="Describe your experiment objectives and methodologies..."
                value={experimentDetails}
                onChange={(e) => setExperimentDetails(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-lg w-full hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : 'Create Group'}
            </button>
          </form>
        </div>
      )}


      <div className="p-4 flex-1 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading groups...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 px-4">
            <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Firebase Permission Error</h3>
            <p className="text-gray-600 mb-4">Unable to load groups due to missing Firebase permissions.</p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left max-w-md mx-auto">
              <p className="text-sm font-semibold text-yellow-800 mb-2">🔧 How to Fix:</p>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Open Firebase Console</li>
                <li>Go to Firestore Database → Rules</li>
                <li>Update rules to allow read/write access</li>
                <li>Publish the changes</li>
                <li>Refresh this page</li>
              </ol>
              <p className="text-xs text-yellow-600 mt-3">
                See <code className="bg-yellow-100 px-1 rounded">FIREBASE_SETUP.md</code> for detailed instructions.
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-10">
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-600">No groups available. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredGroups.map(group => (
              <div key={group.id} className="border border-gray-200 rounded-lg bg-white p-5 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-blue-700">{group.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {group.creatorName || 'Anonymous'}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                    {group.membersCount || 0} members
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm text-gray-700"><span className="font-medium">Subject:</span> {group.subject}</p>
                  </div>

                  {group.experimentDetails && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600 line-clamp-3">{group.experimentDetails}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Created: {group.createdAt?.toLocaleDateString() || 'Recently'}
                  </div>
                  <button
                    onClick={() => onSelectGroup(group)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Join Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}