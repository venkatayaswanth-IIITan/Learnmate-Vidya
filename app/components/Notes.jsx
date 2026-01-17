'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

export default function Notes({ groupId }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (groupId && user) {
      loadFolders();
      loadNotes();
    }
  }, [groupId, user, activeTab, activeFolder]);

  const loadFolders = async () => {
    try {
      const q = query(
        collection(db, 'folders'),
        where('groupId', '==', groupId)
      );
      
      const querySnapshot = await getDocs(q);
      const folderData = [];
      
      querySnapshot.forEach((doc) => {
        folderData.push({ id: doc.id, ...doc.data() });
      });
      
      setFolders(folderData);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const loadNotes = async () => {
    try {
      let q;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (activeFolder) {
        q = query(
          collection(db, 'notes'),
          where('groupId', '==', groupId),
          where('folderId', '==', activeFolder),
          orderBy('createdAt', 'desc')
        );
      } else {
        if (activeTab === 'today') {
          q = query(
            collection(db, 'notes'),
            where('groupId', '==', groupId),
            where('createdAt', '>=', today),
            orderBy('createdAt', 'desc')
          );
        } else if (activeTab === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          q = query(
            collection(db, 'notes'),
            where('groupId', '==', groupId),
            where('createdAt', '>=', weekAgo),
            orderBy('createdAt', 'desc')
          );
        } else {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          q = query(
            collection(db, 'notes'),
            where('groupId', '==', groupId),
            where('createdAt', '>=', monthAgo),
            orderBy('createdAt', 'desc')
          );
        }
      }
      
      const querySnapshot = await getDocs(q);
      const noteData = [];
      
      querySnapshot.forEach((doc) => {
        noteData.push({ id: doc.id, ...doc.data() });
      });
      
      setNotes(noteData);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const folderData = {
        name: newFolderName,
        groupId: groupId,
        createdBy: user.uid,
        createdAt: new Date(),
        color: getRandomColor()
      };
      
      await addDoc(collection(db, 'folders'), folderData);
      setNewFolderName('');
      setIsCreateFolderModalOpen(false);
      loadFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;
    
    try {
      const noteData = {
        title: newNoteTitle,
        content: newNoteContent,
        groupId: groupId,
        folderId: activeFolder,
        createdBy: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await addDoc(collection(db, 'notes'), noteData);
      setNewNoteTitle('');
      setNewNoteContent('');
      setIsCreateNoteModalOpen(false);
      loadNotes();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote || !newNoteTitle.trim()) return;
    
    try {
      const noteRef = doc(db, 'notes', selectedNote.id);
      await updateDoc(noteRef, {
        title: newNoteTitle,
        content: newNoteContent,
        updatedAt: new Date()
      });
      
      setSelectedNote(null);
      setNewNoteTitle('');
      setNewNoteContent('');
      setEditMode(false);
      loadNotes();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setEditMode(true);
    setIsCreateNoteModalOpen(true);
  };

  const getRandomColor = () => {
    const colors = ['blue', 'red', 'yellow', 'green', 'purple', 'pink'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getFolderColor = (color) => {
    const colorMap = {
      blue: 'bg-blue-100',
      red: 'bg-red-100',
      yellow: 'bg-yellow-100',
      green: 'bg-green-100',
      purple: 'bg-purple-100',
      pink: 'bg-pink-100'
    };
    return colorMap[color] || 'bg-gray-100';
  };

  const getNoteColor = (note) => {
    if (!note.folderId) return 'bg-yellow-100';
    
    const folder = folders.find(f => f.id === note.folderId);
    return folder ? getFolderColor(folder.color) : 'bg-yellow-100';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-6 bg-white shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Group Notes</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsCreateFolderModalOpen(true)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              New Folder
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setNewNoteTitle('');
                setNewNoteContent('');
                setIsCreateNoteModalOpen(true);
              }}
              className="bg-[#7289DA] hover:bg-[#5E77D4] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-6 pt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Recent Folders</h2>
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('today')}
            className={`pb-2 px-4 text-sm font-medium ${activeTab === 'today' ? 'text-[#7289DA] border-b-2 border-[#7289DA]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Today's
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`pb-2 px-4 text-sm font-medium ${activeTab === 'week' ? 'text-[#7289DA] border-b-2 border-[#7289DA]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            This Week
          </button>
          <button
            onClick={() => setActiveTab('month')}
            className={`pb-2 px-4 text-sm font-medium ${activeTab === 'month' ? 'text-[#7289DA] border-b-2 border-[#7289DA]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            This Month
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={`${getFolderColor(folder.color)} rounded-lg p-4 shadow cursor-pointer transition-transform transform hover:scale-105`}
            >
              <div className="flex justify-between">
                <div className="h-10 w-10 rounded flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
              </div>
              <h3 className="text-gray-800 font-medium mt-2">{folder.name}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {folder.createdAt && format(folder.createdAt.toDate(), 'MM/dd/yyyy')}
              </p>
            </div>
          ))}
          
          <div
            onClick={() => setIsCreateFolderModalOpen(true)}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-full cursor-pointer hover:border-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-500 mt-2">New folder</span>
          </div>
        </div>
      </div>
      
      <div className="px-6 pt-6 pb-6 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800">
            {activeFolder ? 
              `Notes in ${folders.find(f => f.id === activeFolder)?.name || 'Folder'}` : 
              'My Notes'}
          </h2>
          {activeFolder && (
            <button 
              onClick={() => setActiveFolder(null)}
              className="text-[#7289DA] hover:text-[#5E77D4] text-sm"
            >
              Back to all notes
            </button>
          )}
        </div>
        
        {!activeFolder && (
          <div className="flex space-x-2 border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('today')}
              className={`pb-2 px-4 text-sm font-medium ${activeTab === 'today' ? 'text-[#7289DA] border-b-2 border-[#7289DA]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Today's
            </button>
            <button
              onClick={() => setActiveTab('week')}
              className={`pb-2 px-4 text-sm font-medium ${activeTab === 'week' ? 'text-[#7289DA] border-b-2 border-[#7289DA]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              This Week
            </button>
            <button
              onClick={() => setActiveTab('month')}
              className={`pb-2 px-4 text-sm font-medium ${activeTab === 'month' ? 'text-[#7289DA] border-b-2 border-[#7289DA]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              This Month
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`${getNoteColor(note)} rounded-lg p-4 shadow relative overflow-hidden`}
            >
              <div className="flex justify-between">
                <h3 className="text-gray-800 font-medium">{note.title}</h3>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEditNote(note)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-2 text-gray-600 text-sm max-h-32 overflow-hidden">
                {note.content}
              </div>
              <div className="mt-3 text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {note.createdAt && format(note.createdAt.toDate(), 'h:mm a, EEEE')}
              </div>
            </div>
          ))}
          
          <div
            onClick={() => {
              setEditMode(false);
              setNewNoteTitle('');
              setNewNoteContent('');
              setIsCreateNoteModalOpen(true);
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-48 cursor-pointer hover:border-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium text-gray-500 mt-2">New Note</span>
          </div>
        </div>
      </div>
      
      {isCreateNoteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editMode ? 'Edit Note' : 'Create New Note'}
              </h3>
              <button
                onClick={() => setIsCreateNoteModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="noteTitle"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7289DA] focus:ring-[#7289DA]"
                  placeholder="Note title"
                />
              </div>
              <div>
                <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  id="noteContent"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7289DA] focus:ring-[#7289DA]"
                  placeholder="Write your note here..."
                />
              </div>
              {!editMode && activeFolder === null && folders.length > 0 && (
                <div>
                  <label htmlFor="folderSelect" className="block text-sm font-medium text-gray-700">Add to folder (optional)</label>
                  <select
                    id="folderSelect"
                    onChange={(e) => setActiveFolder(e.target.value || null)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7289DA] focus:ring-[#7289DA]"
                  >
                    <option value="">No folder</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsCreateNoteModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium mr-2"
              >
                Cancel
              </button>
              <button
                onClick={editMode ? handleUpdateNote : handleCreateNote}
                className="bg-[#7289DA] hover:bg-[#5E77D4] text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {editMode ? 'Update Note' : 'Create Note'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Folder</h3>
              <button
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div>
              <label htmlFor="folderName" className="block text-sm font-medium text-gray-700">Folder Name</label>
              <input
                type="text"
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7289DA] focus:ring-[#7289DA]"
                placeholder="Enter folder name"
              />
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="bg-[#7289DA] hover:bg-[#5E77D4] text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}