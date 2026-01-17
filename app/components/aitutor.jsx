"use client"; // Ensure it runs on the client-side in Next.js

import React, { useState, useEffect, useRef } from "react";
import { useSpeechSynthesis } from "react-speech-kit";
// Make sure to install @lottiefiles/react-lottie-player
import { Player } from "@lottiefiles/react-lottie-player";

export default function AICharacterTutor() {
  const { speak, cancel, speaking } = useSpeechSynthesis();
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [characterState, setCharacterState] = useState("idle");
  const playerRef = useRef(null);

  // Character animations for different states - using public Lottie URLs that are more reliable
  const characterAnimations = {
    idle: "https://assets1.lottiefiles.com/packages/lf20_khzniaya.json", // Teacher standing/idle
    thinking: "https://assets9.lottiefiles.com/packages/lf20_ctdnvcsr.json", // Thinking animation
    explaining: "https://assets6.lottiefiles.com/packages/lf20_i9arxzcg.json", // Explaining animation
    greeting: "https://assets1.lottiefiles.com/packages/lf20_khzniaya.json", // Greeting animation
    math: "https://assets2.lottiefiles.com/private_files/lf30_yg7vr2ua.json", // Math animation
    science: "https://assets9.lottiefiles.com/private_files/lf30_tw7br7vj.json" // Science animation
  };

  // Example knowledge topics
  const topics = [
    "How do plants make food?",
    "Why is the sky blue?",
    "What causes earthquakes?",
    "How do computers work?",
    "What is photosynthesis?",
    "How does gravity work?"
  ];

  // Initialize with greeting - using a proper useEffect with empty dependency array
  useEffect(() => {
    // Small delay to ensure components are mounted
    const timer = setTimeout(() => {
      setCharacterState("greeting");
      if (playerRef.current) {
        playerRef.current.play(); // Explicitly play the animation
      }

      // Only attempt to speak if speech synthesis is available
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        speak({
          text: "Hello! I'm Professor AI, your animated tutor. Ask me anything, and I'll explain it to you with helpful visuals!",
          rate: 0.9,
          pitch: 1.1,
          onEnd: () => setCharacterState("idle")
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Update character state based on speaking status
  useEffect(() => {
    if (!speaking && characterState === "explaining" && !loading) {
      setCharacterState("idle");
    }
  }, [speaking, characterState, loading]);

  // Select animation based on question content
  const selectTopicAnimation = (question) => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("math") ||
      lowerQuestion.includes("calculate") ||
      lowerQuestion.includes("equation") ||
      lowerQuestion.includes("number")) {
      return "math";
    } else if (lowerQuestion.includes("science") ||
      lowerQuestion.includes("physics") ||
      lowerQuestion.includes("chemistry") ||
      lowerQuestion.includes("biology")) {
      return "science";
    }

    return "explaining";
  };

  const fetchAIResponse = async () => {
    if (!question) return;

    // Cancel any ongoing speech
    cancel();
    setLoading(true);
    setCharacterState("thinking");

    // Don't try to call methods on playerRef directly - just update state
    // The Player component will re-render with the new animation

    const apiKey = "AIzaSyDXb5osDBC8JEvEhdjsG7ZPiX936HEHHVY";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      // Create a prompt for the character to respond with
      const prompt = `You are Professor AI, an animated cartoon teacher character explaining a concept to a student.
      Create a friendly, enthusiastic explanation about the following topic. Use simple language appropriate for 
      students, include vivid descriptions that would match with animations, and keep your explanation under 150 words:
      ${question}`;

      // Fallback response in case API call fails
      let aiText = "I'm not sure about that right now, but I'd be happy to explain something else!";

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        const data = await res.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          aiText = data.candidates[0].content.parts[0].text;
        }
      } catch (apiError) {
        console.error("API Error:", apiError);
        // Use fallback response defined above
      }

      setResponse(aiText);

      // Set character to appropriate animation based on topic
      const animationState = selectTopicAnimation(question);
      setCharacterState(animationState);

      // Speak the response with the character's voice
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        speak({
          text: aiText,
          rate: 0.9, // Slightly slower for educational content
          pitch: 1.1, // Slightly higher pitch for friendly teacher voice
          onEnd: () => {
            setCharacterState("idle");
          }
        });
      }
    } catch (error) {
      console.error("Error in response handling:", error);
      setResponse("Sorry, I'm having trouble figuring this out right now. Let's try a different question!");
      setCharacterState("idle");
    } finally {
      setLoading(false);
    }
  };

  // Suggest a random topic
  const suggestTopic = () => {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    setQuestion(randomTopic);
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-100 min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-2">Professor AI</h1>
        <p className="text-center text-gray-700 mb-6">Your animated tutor that explains everything!</p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Character Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 flex-1 flex flex-col items-center">
            <div className="relative h-80 w-full flex justify-center">
              {/* The key prop forces re-render when animation changes */}
              <Player
                ref={playerRef}
                autoplay={true}
                loop={true}
                src={characterAnimations[characterState]}
                style={{ height: "100%", width: "auto" }}
                key={characterState} // This forces the component to re-render with new animation
              />

              {/* Speech Bubble when explaining */}
              {(characterState === "explaining" || characterState === "math" || characterState === "science") && response && (
                <div className="absolute top-0 right-0 bg-white rounded-xl shadow-md p-3 max-w-xs border-2 border-indigo-300">
                  <p className="text-sm font-medium text-gray-700">{response.length > 100 ? response.substring(0, 100) + "..." : response}</p>
                </div>
              )}
            </div>

            {/* Response Display */}
            {response && (
              <div className="mt-4 w-full bg-indigo-50 p-3 rounded-lg">
                <h3 className="text-lg font-bold text-indigo-700">Professor AI explains:</h3>
                <p className="text-gray-800 whitespace-pre-line">{response}</p>
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 flex-1 flex flex-col">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like me to explain today?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={5}
            />

            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={fetchAIResponse}
                className={`py-3 px-6 rounded-lg text-white font-bold transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                disabled={loading || !question}
              >
                {loading ? "Professor is thinking..." : "Ask Professor AI"}
              </button>

              <button
                onClick={suggestTopic}
                className="py-2 px-6 rounded-lg text-indigo-700 border border-indigo-300 hover:bg-indigo-50"
              >
                Suggest a topic
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">How it works:</h3>
              <ol className="list-decimal ml-5 text-gray-700 space-y-1">
                <li>Type any question or concept you want explained</li>
                <li>The animated professor will change expressions based on the topic</li>
                <li>Listen and read along as Professor AI explains the concept</li>
                <li>Ask as many questions as you'd like!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}