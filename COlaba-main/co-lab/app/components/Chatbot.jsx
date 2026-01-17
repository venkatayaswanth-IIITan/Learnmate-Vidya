"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, X, Loader2, ChevronDown, Mic, Volume2, StopCircle } from "lucide-react";
import { logEvent, EVENT_TYPES, CONTEXT_MODES, CONTEXT_SOURCES } from "../utils/loggingService";


// Chatbot component
export default function Chatbot({ embedded = false, isOpen: controlledIsOpen, onToggle }) {
  const [internalIsOpen, setInternalIsOpen] = useState(embedded ? true : false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micInputUsed, setMicInputUsed] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechSynthesisRef = useRef(null);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      speechSynthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (isPlaying && speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, [isPlaying]);

  const toggleChat = () => {
    window.open("https://agency-7ilqvp.chat-dash.com/prototype/696b852b6f8ec8d97dca2397", "_blank");

    if (!embedded && !isOpen) {
      logEvent(EVENT_TYPES.CHATBOT_OPENED, {
        mode: CONTEXT_MODES.SOLO,
        source: CONTEXT_SOURCES.DASHBOARD
      }, {
        embedded
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setMicInputUsed(false);
      sendMessage();
    }
  };

  const toggleMic = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        try {
          setInput("I'm speaking through the microphone");
          setMicInputUsed(true);
          setIsRecording(false);

          stream.getTracks().forEach(track => track.stop());

        } catch (error) {
          console.error("Error processing speech:", error);
          setIsRecording(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access your microphone. Please check your browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const speakText = (text) => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      speechSynthesisRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current && isPlaying) {
      speechSynthesisRef.current.cancel();
      setIsPlaying(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    setInput("");
    setIsLoading(true);

    // Log question asked
    logEvent(EVENT_TYPES.QUESTION_ASKED, {
      mode: CONTEXT_MODES.SOLO,
      source: CONTEXT_SOURCES.DASHBOARD
    }, {
      questionLength: input.length
    });

    const wasMicInput = micInputUsed;

    if (micInputUsed) {
      setMicInputUsed(false);
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDXb5osDBC8JEvEhdjsG7ZPiX936HEHHVY`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: input }] }],
          }),
        }
      );

      const data = await response.json();
      let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process your request at this time.";

      reply = reply.replace(/Google/gi, "Vidya AI").replace(/Gemini/gi, "Vidya AI");

      setTimeout(() => {
        const botMessage = { sender: "bot", text: reply };
        setMessages([...newMessages, botMessage]);
        setIsLoading(false);

        if (wasMicInput) {
          speakText(reply);
        }
      }, 300);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages([
        ...newMessages,
        { sender: "bot", text: "I'm having trouble connecting right now. Please try again later." },
      ]);
      setIsLoading(false);
    }
  };

  const chatInterface = (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 border-2 border-black py-3 flex justify-between items-center">
        <div className="flex items-center">
          <MessageCircle size={20} className="text-white mr-2" />
          <h3 className="text-white font-medium">Assistant</h3>
        </div>
        {!embedded && (
          <div className="flex items-center">
            <button
              className="text-white hover:bg-blue-700 p-1 rounded-full transition-colors mr-1"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="h-80 overflow-y-auto px-4 py-3 bg-black">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-12 px-6">
            <MessageCircle size={32} className="mx-auto mb-3 text-blue-500 opacity-50" />
            <p className="text-sm">How can I help you today?</p>
            <p className="text-xs mt-2">Type a message or use the microphone to speak.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 rounded-2xl max-w-xs break-words text-sm ${msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white border border-gray-200 shadow-sm text-gray-800 rounded-bl-none"
                  }`}
              >
                {msg.text}
                {msg.sender === "bot" && (
                  <button
                    onClick={() => isPlaying ? stopSpeaking() : speakText(msg.text)}
                    className="ml-2 text-gray-500 hover:text-blue-600 inline-flex items-center"
                    aria-label={isPlaying ? "Stop speaking" : "Speak message"}
                  >
                    {isPlaying ? <StopCircle size={14} /> : <Volume2 size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="px-4 py-3 rounded-2xl max-w-xs bg-white border border-gray-200 shadow-sm rounded-bl-none">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-gray-500 text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 bg-black border-t border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 p-2 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-500"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setMicInputUsed(false);
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`p-2 rounded-full transition-colors mr-1 ${isRecording
              ? "bg-red-600 text-white animate-pulse"
              : "bg-gray-300 text-gray-600 hover:bg-gray-400"
              }`}
            onClick={toggleMic}
            aria-label={isRecording ? "Stop recording" : "Start voice input"}
          >
            <Mic size={16} />
          </button>
          <button
            className={`p-2 rounded-full transition-colors ${input.trim()
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <Send size={16} className={input.trim() ? "" : "opacity-50"} />
          </button>
        </div>
        <div className="text-xs text-center mt-2 text-gray-400">
          Powered by Vidya AI
        </div>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="w-full bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
        {chatInterface}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-96 bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 transition-all duration-300 ease-in-out transform">
          {chatInterface}
        </div>
      )}
      <button
        className={`p-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${!isOpen && "animate-pulse"
          }`}
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <ChevronDown size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}