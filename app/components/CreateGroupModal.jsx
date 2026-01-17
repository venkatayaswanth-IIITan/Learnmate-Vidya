'use client';

import { useState, useRef, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { createGroup } from '../utils/groups';
import { db } from '../firebase';

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [experimentDetails, setExperimentDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const modalRef = useRef(null);
  const nameInputRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => nameInputRef.current.focus(), 100);
    }
  }, [isOpen]);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target) && !loading) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, loading]);
  
  const resetForm = () => {
    setName('');
    setSubject('');
    setExperimentDetails('');
    setError('');
    setStep(1);
  };
  
  const handleNextStep = () => {
    if (!name.trim()) {
      setError('Please enter a group name');
      return;
    }
    setError('');
    setStep(2);
  };
  
  const handlePrevStep = () => {
    setStep(1);
  };
  
  const handleCancel = () => {
    resetForm();
    onClose();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Group name is required');
      setStep(1);
      return;
    }
    
    if (!subject.trim()) {
      setError('Subject/Topic is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const groupId = await createGroup(name.trim(), subject.trim(), experimentDetails.trim());
      
      if (groupId) {
        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (groupDoc.exists()) {
          const newGroup = {
            id: groupId,
            ...groupDoc.data(),
            createdAt: groupDoc.data().createdAt?.toDate()
          };
          
          onGroupCreated(newGroup);
          resetForm();
          onClose();
        } else {
          throw new Error('Group document not found after creation');
        }
      } else {
        throw new Error('Failed to create group');
      }
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            {step === 1 ? 'Create New Group' : 'Group Details'}
          </h2>
          <button
            onClick={handleCancel}
            className="text-white opacity-75 hover:opacity-100 focus:outline-none"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center px-6 py-3 bg-gray-50">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${step === 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
            2
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}
          
          {step === 1 && (
            <div>
              <div className="mb-6">
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name *
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  id="groupName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  placeholder="Enter a memorable name for your group"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Choose a clear, descriptive name (e.g. "Physics Lab Group")</p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg mr-2"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div>
              <div className="mb-4">
                <label htmlFor="groupSubject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject / Topic *
                </label>
                <input
                  type="text"
                  id="groupSubject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="E.g., Machine Learning Experiment, Physics Lab"
                  required
                  autoFocus
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="experimentDetails" className="block text-sm font-medium text-gray-700 mb-1">
                  Experiment Details (Optional)
                </label>
                <textarea
                  id="experimentDetails"
                  value={experimentDetails}
                  onChange={(e) => setExperimentDetails(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your experiment or discussion topic in more detail"
                  rows="4"
                />
                <p className="mt-1 text-xs text-gray-500">This will help members understand the group's purpose</p>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Group'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}