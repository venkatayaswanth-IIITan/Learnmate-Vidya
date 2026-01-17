"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import getSubjectName from "../utils/getSubjectName";
import fetchExperimentTitle from "../utils/fetchExperimentTitle";
import useLiveUsers from "../utils/useLiveUsers";
import { setUserLiveStatus } from "../utils/useLiveUsers";
import { createGroup } from "../utils/createGroup";
import { 
  FaSignOutAlt, FaGlobe, FaRobot, FaUsers, 
  FaFlask, FaBook, FaChalkboardTeacher, FaUserGraduate, 
  FaLightbulb, FaChartLine, FaVolumeUp, FaVolumeMute 
} from "react-icons/fa";

interface Experiment {
  sub: string;
  sim: string;
  cnt: string;
}

interface LiveUser {
  id: string;
  name: string;
  email: string;
}

export default function Dashboard({ experiment }: { experiment: Experiment | null }) {
  const { user, logout } = useAuth();
  const [subjectName, setSubjectName] = useState("Loading...");
  const [experimentName, setExperimentName] = useState("Loading...");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState("experiment");
  const liveUsers = useLiveUsers(experiment);
  const [showCreateSuccess, setShowCreateSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (experiment) {
        const subject = await getSubjectName(experiment.sub);
        setSubjectName(subject);

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          if (tabs.length > 0 && tabs[0].url) {
            const expTitle = await fetchExperimentTitle(tabs[0].url);
            setExperimentName(expTitle);
          }
        });
      }
    }
    fetchData();
  }, [experiment]);

  useEffect(() => {
    if (experiment && user) {
      setUserLiveStatus(experiment, user.uid, user.displayName || "Anonymous", user.email || "N/A", true);

      return () => {
        setUserLiveStatus(experiment, user.uid, "", "", false);
      };
    }
  }, [experiment, user]);

  const handleCreateGroup = async () => {
    if (!experiment || !user) {
      alert("Cannot create group. Missing experiment details or user not logged in.");
      return;
    }

    setIsLoading(true);
    try {
      const groupName = experimentName;
      const newGroupId = await createGroup(groupName, subjectName, experiment.sim);
      setGroupId(newGroupId);
      setShowCreateSuccess(true);
      setTimeout(() => setShowCreateSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIExplanation = async () => {
    setIsLoading(true);
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length > 0 && tabs[0].url) {

        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC5JJ8UDOsoyVTIGZDFwvUdF0zV6liVHfs`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `Explain nicely the steps of the experiment titled "${experimentName}" in a summarized way using bullet points.` }] }],
              }),
            }
          );

          const data = await response.json();
          const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response.";
          setAiResponse(explanation);
          setActiveTab("ai");
        } catch (error) {
          console.error("AI request failed", error);
          setAiResponse("Failed to fetch AI explanation.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        console.log("Failed to get OLabs URL.");
      }
    });
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (aiResponse) {
      const speech = new SpeechSynthesisUtterance(aiResponse);
      speech.lang = "en-US";
      speech.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(speech);
      setIsSpeaking(true);
    }
  };

  if (!experiment) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="p-8 bg-white rounded-xl shadow-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading experiment details...</p>
        </div>
      </div>
    );
  }

  const getSubjectIcon = () => {
    const subjectLower = subjectName.toLowerCase();
    if (subjectLower.includes("physics")) return <FaLightbulb className="text-yellow-500" />;
    if (subjectLower.includes("chemistry")) return <FaFlask className="text-green-500" />;
    if (subjectLower.includes("biology")) return <FaBook className="text-red-500" />;
    return <FaChalkboardTeacher className="text-blue-500" />;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex flex-col items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">OLabs Assistant</h2>
            <button
              onClick={logout}
              className="p-2 bg-red-500 bg-opacity-25 hover:bg-opacity-50 rounded-full transition-all duration-300"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm bg-white bg-opacity-20 p-2 rounded-lg">
            {getSubjectIcon()}
            <div className="flex-1 truncate">
              <span className="opacity-80">Subject:</span> {subjectName}
            </div>
          </div>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("experiment")}
            className={`flex-1 py-3 font-medium flex justify-center items-center gap-2 transition-all ${
              activeTab === "experiment"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-400"
            }`}
          >
            <FaFlask /> Experiment
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-3 font-medium flex justify-center items-center gap-2 transition-all ${
              activeTab === "users"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-400"
            }`}
          >
            <FaUsers /> Users
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
              {liveUsers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex-1 py-3 font-medium flex justify-center items-center gap-2 transition-all ${
              activeTab === "ai"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-400"
            }`}
          >
            <FaRobot /> AI Help
          </button>
        </div>

        <div className="p-4">
          {activeTab === "experiment" && (
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <h3 className="font-semibold text-indigo-800 mb-1 flex items-center gap-2">
                  <FaChartLine /> Current Experiment
                </h3>
                <p className="text-indigo-700 font-medium text-lg">{experimentName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.open("http://localhost:3000/", "_blank")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg shadow hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FaGlobe className="text-lg" /> Main Website
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={isLoading}
                  className={`bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-lg shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <FaUsers className="text-lg" /> Create Group
                    </>
                  )}
                </button>
                <button
                  onClick={handleAIExplanation}
                  disabled={isLoading}
                  className={`col-span-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-3 px-4 rounded-lg shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <FaRobot className="text-lg" /> Get AI Explanation
                    </>
                  )}
                </button>
              </div>

              {showCreateSuccess && (
                <div className="bg-green-100 border border-green-200 text-green-800 rounded-lg p-3 flex items-center gap-2 animate-fade-in">
                  <div className="bg-green-500 text-white p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Group created successfully!</p>
                    <p className="text-xs">ID: {groupId}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <h3 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                  <FaUserGraduate /> Online Students
                </h3>
                
                {liveUsers.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {liveUsers.map((user: LiveUser) => (
                      <div key={user.id} className="bg-white p-3 rounded-lg shadow-sm border border-indigo-100 flex items-center gap-3">
                        <div className="bg-indigo-100 text-indigo-600 rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <FaUsers className="mx-auto text-3xl mb-2 text-gray-300" />
                    <p>No users online at the moment</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-indigo-800 flex items-center gap-2">
                  <FaRobot /> AI Explanation
                </h3>
                {aiResponse && (
                  <button 
                    onClick={toggleSpeech}
                    className={`p-2 rounded-full ${isSpeaking ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}
                  >
                    {isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                )}
              </div>
              
              {aiResponse ? (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100 max-h-64 overflow-y-auto">
                  {aiResponse.includes("\n") ? (
                    <ul className="space-y-2 text-gray-700">
                      {aiResponse.split("\n").map((point, index) =>
                        point.trim() ? (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-indigo-500 mt-1">•</span>
                            <span>{point.trim()}</span>
                          </li>
                        ) : null
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-700">{aiResponse}</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaRobot className="mx-auto text-3xl mb-3 text-gray-300" />
                  <p>Click "Get AI Explanation" to receive a summary of the experiment</p>
                  <button
                    onClick={handleAIExplanation}
                    className="mt-4 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors"
                  >
                    Generate Explanation
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-3 text-center text-xs text-gray-500 border-t">
          OLabs Assistant v2.0 • Enhancing virtual laboratory learning
        </div>
      </div>
    </div>
  );
}