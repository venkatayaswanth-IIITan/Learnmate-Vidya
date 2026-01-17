import { useState } from "react";
import { FaRobot } from "react-icons/fa";

export default function AIExplanation() {
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const fetchPageContent = async () => {
    try {
      const response = await fetch(window.location.href); 
      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");
      
      const extractedText = doc.body.innerText || "No readable content found.";
      
      return extractedText;
    } catch (error) {
      console.error("Error fetching page content:", error);
      return "Failed to fetch page content.";
    }
  };

  const handleAIExplanation = async () => {
    const pageContent = await fetchPageContent();
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC5JJ8UDOsoyVTIGZDFwvUdF0zV6liVHfs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Summarize this educational content:\n${pageContent.slice(0, 2000)}` }] }],
          }),
        }
      );

      const data = await response.json();
      console.log("Full API Response:", data); 

      const explanation =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response received.";
        
      setAiResponse(explanation);

      const speech = new SpeechSynthesisUtterance(explanation);
      speech.lang = "en-US";
      window.speechSynthesis.speak(speech);
    } catch (error) {
      console.error("AI request failed", error);
      setAiResponse("Failed to fetch AI explanation.");
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
      <button className="w-full p-3 bg-purple-500 text-white rounded-lg flex items-center justify-center gap-2"
        onClick={handleAIExplanation}>
        <FaRobot /> AI Explanation
      </button>

      {aiResponse && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">AI Summary</h3>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>
  );
}
