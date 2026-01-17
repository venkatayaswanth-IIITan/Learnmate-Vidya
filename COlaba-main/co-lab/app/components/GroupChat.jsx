
'use client';

import { useState, useEffect, useRef } from 'react';
import { listenToMessages, sendMessage, getGroupMembers } from '../utils/messaging';
import { auth } from '../firebase';
import { logEvent, EVENT_TYPES, CONTEXT_MODES, CONTEXT_SOURCES } from '../utils/loggingService';

export default function GroupChat({ group }) {
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!group?.id) return;

    setLoading(true);

    const unsubscribeMessages = listenToMessages(group.id, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    const unsubscribeMembers = getGroupMembers(group.id, setMembers);

    return () => {
      unsubscribeMessages();
      unsubscribeMembers();
    };
  }, [group?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !group?.id) return;

    await sendMessage(group.id, newMessage);

    // Log chat message
    logEvent(EVENT_TYPES.CHAT_SENT, {
      mode: CONTEXT_MODES.GROUP,
      source: CONTEXT_SOURCES.LIVE_SESSION
    }, {
      groupId: group.id,
      groupName: group.name,
      messageLength: newMessage.length
    });

    setNewMessage('');
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (e.target.value && !isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

  if (!group) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-md p-8">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Co-Lab AI</h3>
          <p className="text-gray-500 mb-6">Join or create a group to start collaborating with your team</p>
          <button
            onClick={() => document.querySelector('[data-create-group]').click()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md transition-all hover:shadow-lg transform hover:scale-105"
          >
            Create Your First Group
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3 shadow-sm">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{group.name}</h2>
              <p className="text-sm text-gray-500">{group.subject}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </div>
          <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 bg-opacity-70">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-200 rounded-full mb-3 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-blue-600 font-medium">Loading messages...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">No messages yet in this group</p>
              <p className="text-blue-600 font-medium">Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map(message => {
                const isOwnMessage = message.uid === auth.currentUser?.uid;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      <div className="flex items-end">
                        {!isOwnMessage && (
                          <div className="flex-shrink-0 mr-2">
                            {message.photoURL ? (
                              <img
                                src={message.photoURL}
                                alt={message.displayName}
                                className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white border-2 border-white shadow-sm">
                                {message.displayName?.charAt(0).toUpperCase() || 'A'}
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          {!isOwnMessage && (
                            <div className="text-xs text-gray-500 mb-1 ml-1 font-medium">{message.displayName}</div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 shadow-sm ${isOwnMessage
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none'
                              : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                              }`}
                          >
                            <p className="leading-relaxed">{message.text}</p>
                          </div>
                          <div className="text-xs text-gray-400 mt-1 ml-1 flex items-center">
                            {message.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isOwnMessage && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-xs md:max-w-md lg:max-w-lg">
                    <div className="flex items-end">
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-white border-2 border-white shadow-sm animate-pulse">
                          ?
                        </div>
                      </div>
                      <div>
                        <div className="rounded-2xl px-4 py-2 shadow-sm bg-white text-gray-800 rounded-bl-none border border-gray-200">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "200ms" }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "400ms" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="w-64 bg-white border-l border-gray-200 p-4 hidden md:block">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Group Members
          </h3>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500">No members yet</p>
          ) : (
            <ul className="space-y-3">
              {members.map(member => (
                <li key={member.uid} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="relative">
                    {member.photoURL ? (
                      <img
                        src={member.photoURL}
                        alt={member.displayName}
                        className="w-8 h-8 rounded-full mr-2 border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mr-2 shadow-sm">
                        {member.displayName?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    )}
                    <span
                      className={`absolute bottom-0 right-1 w-3 h-3 rounded-full border-2 border-white ${member.online ? 'bg-green-500' : 'bg-gray-300'}`}
                    ></span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">{member.displayName}</span>

                  {member.online && (
                    <span className="ml-auto text-xs text-green-600 font-medium">online</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="w-full border border-gray-300 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}