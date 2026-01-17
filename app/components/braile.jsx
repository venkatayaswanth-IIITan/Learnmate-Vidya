import { useState } from "react";
import { jsPDF } from "jspdf";

const brailleMap = {
  a: "⠁", b: "⠃", c: "⠉", d: "⠙", e: "⠑", f: "⠋", g: "⠛", h: "⠓",
  i: "⠊", j: "⠚", k: "⠅", l: "⠇", m: "⠍", n: "⠝", o: "⠕", p: "⠏",
  q: "⠟", r: "⠗", s: "⠎", t: "⠞", u: "⠥", v: "⠧", w: "⠺", x: "⠭",
  y: "⠽", z: "⠵", " ": " ", ".": "⠲", ",": "⠂", "?": "⠦", "!": "⠖",
  "-": "⠤", "@": "⠈", "#": "⠼", "1": "⠁", "2": "⠃", "3": "⠉", "4": "⠙",
  "5": "⠑", "6": "⠋", "7": "⠛", "8": "⠓", "9": "⠊", "0": "⠚"
};

const convertToBraille = (text) => {
  return text
    .toLowerCase()
    .split("")
    .map((char) => brailleMap[char] || "⠿")
    .join(" ");
};

export default function BrailleGenerator({ query }) {
  const [explanation, setExplanation] = useState("");
  const [brailleText, setBrailleText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);

  const generateBraille = async () => {
    if (!query.trim()) {
      setError("Please enter a query to convert to Braille");
      return;
    }

    setIsLoading(true);
    setError("");
    setIsGenerated(false);

    try {
      // Get explanation from Gemini API
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDXb5osDBC8JEvEhdjsG7ZPiX936HEHHVY",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Explain in detail: ${query}` }] }],
          }),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "Failed to get explanation");

      setExplanation(data?.candidates?.[0]?.content?.parts?.[0]?.text || "No explanation available");

      setBrailleText(convertToBraille(query));
      setIsGenerated(true);
    } catch (error) {
      console.error("Error generating Braille:", error);
      setError(error.message || "Failed to generate Braille. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 500;
    canvas.height = 300;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '24px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('Braille Output:', 20, 40);

    ctx.font = '24px "Arial Unicode MS", sans-serif';

    const wrappedText = wrapText(ctx, brailleText, 460, 24);
    wrappedText.forEach((line, index) => {
      ctx.fillText(line, 20, 80 + (index * 30));
    });

    const doc = new jsPDF();

    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 10, 10, 190, 0);

    doc.save("braille_output.pdf");
  };

  const wrapText = (ctx, text, maxWidth, lineHeight) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;

      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    lines.push(currentLine);
    return lines;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-800 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">
          Braille Generator
        </h1>

        <div className="bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gray-300 text-black p-4">
            <p className="text-lg font-medium mb-2">Converting to Braille:</p>
            <p className="bg-gray-200 p-3 rounded-lg border border-gray-400 font-medium text-black">
              {query || "Study of pollutants in Air"}
            </p>
          </div>

          <div className="p-5 space-y-4">
            <button
              onClick={generateBraille}
              className={`w-full ${isLoading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
                } text-white font-bold px-4 py-3 rounded-lg transition-all transform hover:scale-105 flex justify-center items-center space-x-2 shadow-lg`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse">⏳</span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Generate Braille</span>
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg animate-bounce">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}

            {isGenerated && (
              <button
                onClick={downloadPDF}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-4 py-3 rounded-lg transition-all transform hover:scale-105 flex justify-center items-center space-x-2 shadow-lg"
              >
                <span>📥</span>
                <span>Download Braille PDF</span>
              </button>
            )}
          </div>

          {isGenerated && (
            <div className="p-5 pt-0 grid grid-cols-1 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-inner border border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-md font-bold text-gray-800">Braille Output:</p>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Generated
                  </span>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-2xl h-24 overflow-auto border border-gray-300 text-black">
                  {brailleText}
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-300 p-3 text-center text-gray-700 text-sm">
            Making text accessible through Braille conversion
          </div>
        </div>
      </div>
    </div>
  );
}