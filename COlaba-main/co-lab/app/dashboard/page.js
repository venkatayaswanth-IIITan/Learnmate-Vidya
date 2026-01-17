"use client";

import { useState, useEffect, useRef } from "react";
import { useFont } from "../context/FontContext";
import { useAuth } from "../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import GroupList from "../components/GroupList";
import GroupChat from "../components/GroupChat";
import CreateGroupModal from "../components/CreateGroupModal";
import OnlineUsers from "../components/OnlineUsers";
import UserGroups from "../components/UserGroups";
import Whiteboard from "../components/Whiteboard";
import VideoCall from "../components/VideoCall";
import Notes from "../components/Notes";
import { setupPresence } from "../utils/presence";
import LiveQuiz from "../components/QuizComponent";
import DashboardLayout from "../components/sidebar";
import { getAvailableGroups } from "../utils/groups";
import BrailleGenerator from "../components/braile";
import Chatbot from "../components/Chatbot";
import StudentProfile from "../components/StudentProfile";
import ScheduledSessions from "../components/ScheduledSessions";

export default function Dashboard() {
  const { user, logout, userPoints } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [userGroups, setUserGroups] = useState([]);
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const {
    fontSize,
    fontFamily,
    lineSpacing,
    highContrast,
    changeFontSize,
    changeFontFamily,
    changeLineSpacing,
    toggleHighContrast,
  } = useFont();

  useEffect(() => {
    // Removed authentication check - allow access without login
    // if (!user) {
    //   router.push("/login");
    //   return;
    // }

    const cleanupPresence = setupPresence();


    const unsubscribe = getAvailableGroups(setUserGroups);

    return () => {
      if (cleanupPresence) cleanupPresence();
      unsubscribe();
    };
  }, [user, router]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'profile') {
      setActiveTab('profile');
      setSelectedGroup(null);
      setIsProfileOpen(false);
    }
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setActiveTab("chat");
  };

  const handleCreateGroup = () => {
    setIsCreateModalOpen(true);
  };

  const handleGroupCreated = (newGroup) => {
    setSelectedGroup(newGroup);
    setIsCreateModalOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Removed authentication check - allow access without login
  // if (!user) {
  //   return <div>Loading...</div>;
  // }

  const getInitials = (email) => {
    if (!email) return "";
    const parts = email.split("@")[0].split(/[._-]/);
    return parts
      .map((part) => part[0]?.toUpperCase() || "")
      .join("")
      .substring(0, 2);
  };

  const toggleChatbot = () => {
    window.open("https://agency-7ilqvp.chat-dash.com/prototype/696b852b6f8ec8d97dca2397", "_blank");
  };

  return (
    <>
      <DashboardLayout activeItem="dashboard" onChatAssistantClick={toggleChatbot}>
        <div className={`rounded-3xl shadow-inner h-full p-8 overflow-y-auto transition-colors duration-500 ${isDarkMode ? "bg-slate-900" : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
          }`}>
          <nav className={`rounded-2xl z-20 mb-8 backdrop-blur-xl sticky top-0 shadow-sm transition-all duration-300 ${isDarkMode ? "bg-slate-800/70 border border-slate-700/50" : "bg-white/70 border border-white/50"
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center">
                  <h1 className={`text-3xl tracking-tight ${isDarkMode ? "text-white" : "text-slate-800"}`}>Welcome to <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Vidya AI</span></h1>

                </div>

                <div className="flex items-center space-x-4 ml-auto">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2.5 rounded-full transition-colors shadow-sm border ${isDarkMode
                      ? "bg-slate-700 border-slate-600 text-yellow-400 hover:bg-slate-600"
                      : "bg-white/50 border-white/50 text-slate-500 hover:bg-white hover:text-indigo-600"
                      }`}
                  >
                    {isDarkMode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </button>

                  <button className={`p-2.5 rounded-full transition-colors shadow-sm border ${isDarkMode
                    ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
                    : "bg-white/50 border-white/50 text-slate-500 hover:bg-white hover:text-indigo-600"
                    }`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </button>

                  <div className="relative" ref={profileRef}>
                    <div
                      onClick={toggleProfile}
                      className="flex items-center cursor-pointer transition-transform hover:scale-105"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-semibold shadow-md shadow-indigo-200 ring-2 ring-white">
                        {user ? getInitials(user.email) : "GU"}
                      </div>
                    </div>

                    {isProfileOpen && (
                      <div className="absolute right-0 top-10 w-64 bg-white rounded-xl shadow-lg py-1 z-20 border border-gray-100">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm text-gray-500">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user ? user.email : "Guest User"}
                          </p>
                        </div>

                        <div className="py-1">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsProfileOpen(false);
                              setSelectedGroup(null);
                              setActiveTab("profile");
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Profile Settings
                          </a>
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 17.25l4.95 2.61-1.27-5.42L20 10.92l-5.52-.47L12 5.5l-2.48 4.95-5.52.47 4.32 3.52-1.27 5.42L12 17.25z"
                              />
                            </svg>
                            Points: {userPoints}
                          </a>
                          <button
                            onClick={() => setShowFontSettings(!showFontSettings)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Text Settings
                          </button>
                        </div>

                        <div className="py-1 border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="overflow-hidden">
            {selectedGroup ? (
              <>
                <div className="bg-white/80 backdrop-blur-md shadow-lg px-6 py-3 flex flex-wrap gap-3 border border-indigo-50 items-center rounded-3xl mb-8 sticky top-24 z-10 transition-all duration-300">
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="py-2.5 px-5 font-bold text-indigo-600 flex text-sm items-center mr-2 hover:bg-indigo-50 rounded-full transition-colors duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back
                  </button>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`py-2.5 px-6 font-semibold text-sm rounded-full transition-all duration-300 shadow-sm ${activeTab === "chat"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200 shadow-md transform scale-105"
                      : "bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab("whiteboard")}
                    className={`py-2.5 px-6 font-semibold text-sm rounded-full transition-all duration-300 shadow-sm ${activeTab === "whiteboard"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200 shadow-md transform scale-105"
                      : "bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                  >
                    Whiteboard
                  </button>

                  <button
                    onClick={() => setActiveTab("notes")}
                    className={`py-2.5 px-6 font-semibold text-sm rounded-full transition-all duration-300 shadow-sm ${activeTab === "notes"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200 shadow-md transform scale-105"
                      : "bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                  >
                    Notes
                  </button>
                  <button
                    onClick={() => setActiveTab("quiz")}
                    className={`py-2.5 px-6 font-semibold text-sm rounded-full transition-all duration-300 shadow-sm ${activeTab === "quiz"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200 shadow-md transform scale-105"
                      : "bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                  >
                    Quiz
                  </button>
                  <button
                    onClick={() => setActiveTab("braille")}
                    className={`py-2.5 px-6 font-semibold text-sm rounded-full transition-all duration-300 shadow-sm ${activeTab === "braille"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200 shadow-md transform scale-105"
                      : "bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                  >
                    Braille
                  </button>
                  <button
                    onClick={() => setActiveTab("scheduled_sessions")}
                    className={`py-2.5 px-6 font-semibold text-sm rounded-full transition-all duration-300 shadow-sm ${activeTab === "scheduled_sessions"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200 shadow-md transform scale-105"
                      : "bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                  >
                    Scheduled Sessions
                  </button>
                </div>

                <div className="overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl h-[800px] transition-all duration-500">                {activeTab === "chat" && <GroupChat group={selectedGroup} />}
                  {activeTab === "whiteboard" && (
                    <Whiteboard groupId={selectedGroup.id} />
                  )}
                  {activeTab === "video" && (
                    <VideoCall
                      roomId={selectedGroup.id}
                      onLeaveCall={() => setActiveTab("chat")}
                    />
                  )}
                  {activeTab === "notes" && <Notes groupId={selectedGroup.id} />}
                  {activeTab === "quiz" && (
                    <LiveQuiz groupId={selectedGroup.name} />
                  )}
                  {activeTab === "braille" && (
                    <BrailleGenerator query={selectedGroup.name} />
                  )}
                  {activeTab === "braille" && (
                    <BrailleGenerator query={selectedGroup.name} />
                  )}
                  {activeTab === "scheduled_sessions" && (
                    <ScheduledSessions
                      groupId={selectedGroup.id}
                      onJoin={() => setActiveTab("video")}
                    />
                  )}
                </div>
              </>
            ) : activeTab === "profile" ? (
              <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="mr-4 p-2 rounded-full hover:bg-white/50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>Student Profile</h1>
                </div>
                <StudentProfile />
              </div>
            ) : (
              <div className="space-y-8 p-2 sm:p-4">
                <div className={`flex items-center justify-between backdrop-blur-md border p-6 rounded-3xl shadow-sm ${isDarkMode ? "bg-slate-800/70 border-slate-700" : "bg-white/70 border-indigo-50"
                  }`}>
                  <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-800"}`}>My Groups</h1>
                </div>

                <div className="w-full">
                  <UserGroups
                    asCards={true}
                    onSelectGroup={handleGroupSelect}
                    activeGroupId={selectedGroup?.id}
                    isDarkMode={isDarkMode}
                    maxGroups={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 h-full gap-6 mt-6">
                  <div className={`rounded-3xl shadow-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${isDarkMode
                    ? "bg-slate-800 border-slate-700 shadow-slate-900/50 hover:shadow-slate-900/50"
                    : "bg-white border-slate-100 shadow-indigo-100/50 hover:shadow-indigo-200/50"
                    }`}>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                          Active Groups
                        </h2>
                        <Link
                          href="/groups"
                          className="text-indigo-600 text-sm font-medium hover:text-indigo-700 hover:underline transition-colors"
                        >
                          View all
                        </Link>
                      </div>

                      <table className="w-full">
                        <thead>
                          <tr className={`text-left text-xs uppercase tracking-wider font-semibold border-b ${isDarkMode ? "text-slate-400 border-slate-700" : "text-slate-500 border-slate-100"
                            }`}>
                            <th className="pb-3 pl-2">Group</th>
                            <th className="pb-3">Subject</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? "divide-slate-700" : "divide-slate-50"}`}>
                          {userGroups.length === 0 ? (
                            <tr>
                              <td
                                colSpan="4"
                                className="py-8 text-center text-slate-400 text-sm"
                              >
                                No groups available. Create one to get started!
                              </td>
                            </tr>
                          ) : (
                            userGroups.slice(0, 5).map((group) => (
                              <tr
                                key={group.id}
                                className={`group cursor-pointer transition-colors ${isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-indigo-50/50"
                                  }`}
                                onClick={() => handleGroupSelect(group)}
                              >
                                <td className="py-4 pl-2">
                                  <div>
                                    <p className={`font-medium transition-colors ${isDarkMode ? "text-slate-200 group-hover:text-indigo-400" : "text-slate-700 group-hover:text-indigo-700"
                                      }`}>
                                      {group.name}
                                    </p>
                                  </div>
                                </td>
                                <td className="py-4">
                                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDarkMode
                                    ? "bg-pink-900/30 text-pink-300 border-pink-800"
                                    : "bg-pink-100 text-pink-700 border-pink-200"
                                    }`}>
                                    {group.subject}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className={`rounded-3xl shadow-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${isDarkMode
                    ? "bg-slate-800 border-slate-700 shadow-slate-900/50 hover:shadow-slate-900/50"
                    : "bg-white border-slate-100 shadow-indigo-100/50 hover:shadow-indigo-200/50"
                    }`}>
                    <div className="p-6">
                      <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                        Recommended Group
                      </h2>


                      <div className={`rounded-2xl p-5 border ${isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-gradient-to-br from-indigo-50 to-white border-indigo-100"
                        }`}>
                        {userGroups.length > 0 && (
                          <>
                            <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                              {userGroups[0]?.name ||
                                "Data Analysis Fundamentals"}
                              <span className={`ml-2 inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 border ${isDarkMode
                                ? "bg-indigo-900/50 text-indigo-300 border-indigo-800"
                                : "bg-indigo-100 text-indigo-700 border-indigo-200"
                                }`}>
                                {userGroups[0]?.subject || "Computer Science"}
                              </span>
                            </h3>

                            <div className="mt-4">
                              <div className="flex -space-x-2 overflow-hidden mb-3">
                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                  {getInitials(
                                    userGroups[0]?.creatorName || "User"
                                  )}
                                </div>
                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-green-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                  {getInitials("Group Member")}
                                </div>
                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                  +{userGroups[0]?.membersCount || 0}
                                </div>
                              </div>
                              <p className="text-slate-500 text-sm">
                                People are currently active here
                              </p>
                            </div>

                            <button
                              onClick={() => handleGroupSelect(userGroups[0])}
                              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all duration-300 transform hover:scale-[1.02]"
                            >
                              Join Group
                            </button>
                          </>
                        )}

                        {userGroups.length === 0 && (
                          <>
                            <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-2 border ${isDarkMode
                              ? "bg-yellow-900/30 text-yellow-500 border-yellow-800"
                              : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }`}>
                              Computer Science
                            </span>
                            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                              Start your journey
                            </h3>
                            <p className={`${isDarkMode ? "text-slate-400" : "text-slate-500"} text-sm`}>
                              Create a group to begin collaborative learning!
                            </p>
                            <button
                              onClick={handleCreateGroup}
                              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all duration-300 transform hover:scale-[1.02]"
                            >
                              Create Group
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div >

        <CreateGroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onGroupCreated={handleGroupCreated}
        />

        {
          showFontSettings && (
            <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full border-black border-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl text-black font-bold">Accessibility Settings</h2>
                  <button
                    onClick={() => setShowFontSettings(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeFontSize("small")}
                        className={`px-3 py-1 rounded-md ${fontSize === "small"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-black"
                          }`}
                      >
                        Small
                      </button>
                      <button
                        onClick={() => changeFontSize("medium")}
                        className={`px-3 py-1 rounded-md ${fontSize === "medium"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-black"
                          }`}
                      >
                        Medium
                      </button>
                      <button
                        onClick={() => changeFontSize("large")}
                        className={`px-3 py-1 rounded-md ${fontSize === "large"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-black"
                          }`}
                      >
                        Large
                      </button>
                      <button
                        onClick={() => changeFontSize("x-large")}
                        className={`px-3 py-1 rounded-md ${fontSize === "x-large"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-black"
                          }`}
                      >
                        X-Large
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Spacing
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-black"
                        onClick={() =>
                          changeLineSpacing(Math.max(1, lineSpacing - 0.1))
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={lineSpacing}
                        onChange={(e) =>
                          changeLineSpacing(parseFloat(e.target.value))
                        }
                        className="w-full "
                      />
                      <button
                        className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-black"
                        onClick={() =>
                          changeLineSpacing(Math.min(3, lineSpacing + 0.1))
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {lineSpacing.toFixed(1)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Style
                    </label>
                    <select
                      className="block w-full py-2 px-3 border border-gray-300 text-black bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#ff5722] focus:border-[#ff5722]"
                      value={fontFamily}
                      onChange={(e) => changeFontFamily(e.target.value)}
                    >
                      <option value="system">System Default</option>
                      <option value="serif">Serif</option>
                      <option value="default">Sans Serif</option>
                      <option value="dyslexic">Dyslexic Friendly</option>
                      <option value="comic-sans">Comic Sans</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      High Contrast Mode
                    </span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        name="toggle"
                        id="contrast-toggle"
                        className="sr-only"
                        checked={highContrast}
                        onChange={toggleHighContrast}
                      />
                      <label
                        htmlFor="contrast-toggle"
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer ${highContrast ? "bg-blue-600" : "bg-gray-300"
                          }`}
                      ></label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowFontSettings(false)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Apply & Close
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </DashboardLayout >

      {/* Chatbot Component */}
      < Chatbot isOpen={isChatbotOpen} onToggle={toggleChatbot} />
    </>
  );
}
