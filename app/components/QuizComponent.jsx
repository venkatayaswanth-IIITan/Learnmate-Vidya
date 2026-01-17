'use client';
import { useState, useEffect } from 'react';
import { db, rtdb } from '../firebase';
import { ref, onValue, set, push, remove, update, onDisconnect, get } from 'firebase/database';
import { collection, onSnapshot, addDoc, query, orderBy, deleteDoc, getDocs } from 'firebase/firestore';

export default function LiveQuiz({ groupId, topic, userId }) {
  const [quizData, setQuizData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [quizStatus, setQuizStatus] = useState('inactive');
  const [userAnswers, setUserAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userReady, setUserReady] = useState(false);
  const [readyUsers, setReadyUsers] = useState({});
  const [countdownToStart, setCountdownToStart] = useState(null);

  const currentUser = userId || 'anonymous';

  useEffect(() => {
    const quizCollection = collection(db, 'quizzes', groupId, 'questions');
    const q = query(quizCollection, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuizData(questions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    const quizStatusRef = ref(rtdb, `groups/${groupId}/quiz`);
    const participantsRef = ref(rtdb, `groups/${groupId}/participants`);
    const readyUsersRef = ref(rtdb, `groups/${groupId}/readyUsers`);

    const statusHandler = onValue(quizStatusRef, (snapshot) => {
      const data = snapshot.val() || {};
      setQuizStatus(data.status || 'inactive');
      setCurrentQuestion(data.currentQuestion || 0);
      setTimeLeft(data.timeLeft || null);
      setShowResults(data.showResults || false);
      setCountdownToStart(data.countdownToStart || null);
      console.log("Quiz status updated:", data.status);
    });

    const participantsHandler = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const participantsArray = Object.values(data);
      setParticipants(participantsArray);
      console.log('Current participants:', participantsArray);
    });

    const readyUsersHandler = onValue(readyUsersRef, (snapshot) => {
      const data = snapshot.val() || {};
      setReadyUsers(data);
    });

    const scoresRef = ref(rtdb, `groups/${groupId}/scores`);
    const scoresHandler = onValue(scoresRef, (snapshot) => {
      const data = snapshot.val() || {};
      setScores(data);
    });

    const answersRef = ref(rtdb, `groups/${groupId}/answers`);
    const answersHandler = onValue(answersRef, (snapshot) => {
      const data = snapshot.val() || {};
      setUserAnswers(data);
    });

    const joinQuiz = async () => {
      const userRef = ref(rtdb, `groups/${groupId}/participants/${currentUser}`);

      await set(userRef, {
        userId: currentUser,
        joinedAt: new Date().toISOString(),
        displayName: `User-${currentUser.substring(0, 5)}`
      });

      onDisconnect(userRef).remove();

      const readyUserRef = ref(rtdb, `groups/${groupId}/readyUsers/${currentUser}`);
      onDisconnect(readyUserRef).remove();

      console.log(`User ${currentUser} joined the quiz`);
    };

    joinQuiz();

    return () => {
      statusHandler();
      participantsHandler();
      scoresHandler();
      answersHandler();
      readyUsersHandler();

      const userRef = ref(rtdb, `groups/${groupId}/participants/${currentUser}`);
      remove(userRef);

      const readyUserRef = ref(rtdb, `groups/${groupId}/readyUsers/${currentUser}`);
      remove(readyUserRef);
    };
  }, [groupId, currentUser]);

  useEffect(() => {
    if (quizStatus === 'ready') {
      const readyCount = Object.keys(readyUsers).length;
      const participantCount = participants.length;

      console.log(`Ready users: ${readyCount}, Participants: ${participantCount}`);

      if (readyCount >= 1 && countdownToStart === null) {
        update(ref(rtdb, `groups/${groupId}/quiz`), {
          countdownToStart: 5
        });
      }
    }
  }, [readyUsers, quizStatus, groupId, countdownToStart, participants.length]);

  useEffect(() => {
    if (countdownToStart !== null && countdownToStart > 0) {
      const timer = setTimeout(() => {
        update(ref(rtdb, `groups/${groupId}/quiz`), {
          countdownToStart: countdownToStart - 1
        });
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdownToStart === 0) {
      startQuiz();
    }
  }, [countdownToStart, groupId]);

  useEffect(() => {
    if (quizStatus === 'active' && timeLeft > 0) {
      const timer = setTimeout(() => {
        const timeRef = ref(rtdb, `groups/${groupId}/quiz/timeLeft`);
        get(timeRef).then((snapshot) => {
          if (snapshot.exists() && snapshot.val() === timeLeft) {
            update(ref(rtdb, `groups/${groupId}/quiz`), {
              timeLeft: timeLeft - 1
            });
          }
        });
      }, 1000);

      return () => clearTimeout(timer);
    } else if (quizStatus === 'active' && timeLeft === 0) {
      nextQuestion();
    }
  }, [timeLeft, quizStatus, groupId]);

  async function toggleReady() {
    const newReadyStatus = !userReady;
    setUserReady(newReadyStatus);

    const readyUserRef = ref(rtdb, `groups/${groupId}/readyUsers/${currentUser}`);

    if (newReadyStatus) {
      await set(readyUserRef, true);
    } else {
      await remove(readyUserRef);
    }

    console.log(`User ${currentUser} is now ${newReadyStatus ? 'ready' : 'not ready'}`);
  }

  async function generateNewQuiz() {
    setLoading(true);

    try {
      await set(ref(rtdb, `groups/${groupId}/quiz`), {
        status: 'generating',
        currentQuestion: 0,
        timeLeft: null,
        showResults: false,
        startedAt: new Date().toISOString(),
        countdownToStart: null
      });

      await remove(ref(rtdb, `groups/${groupId}/answers`));
      await remove(ref(rtdb, `groups/${groupId}/scores`));
      await remove(ref(rtdb, `groups/${groupId}/readyUsers`));

      const quizCollection = collection(db, 'quizzes', groupId, 'questions');
      const querySnapshot = await getDocs(query(quizCollection));

      const deletePromises = [];
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log(`Deleted ${deletePromises.length} existing questions`);
      }

      const prompt = `Generate a quiz with 5 multiple-choice questions about ${groupId}.
        Return ONLY a valid JSON array with no markdown formatting, code blocks, or explanatory text.
        Each question object must contain:
        1. question (string)
        2. options (array of 4 strings)
        3. correctAnswer (integer 0-3 representing the index of the correct option)
        4. explanation (string explaining why the answer is correct)
        
        Your entire response must be a parseable JSON array.`;

      console.log("Generated Prompt:", prompt);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=AIzaSyDXb5osDBC8JEvEhdjsG7ZPiX936HEHHVY`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Gemini API raw response:", JSON.stringify(data));

      let questions;
      try {
        let responseText = '';

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const content = data.candidates[0].content;
          if (content.parts && content.parts[0] && content.parts[0].text) {
            responseText = content.parts[0].text;
          }
        } else if (data.contents && data.contents[0] && data.contents[0].parts) {
          const parts = data.contents[0].parts;
          if (parts[0] && parts[0].text) {
            responseText = parts[0].text;
          }
        } else if (data.text) {
          responseText = data.text;
        }

        console.log("Extracted response text:", responseText);

        if (!responseText) {
          console.error("Couldn't find text in response structure:", data);
          throw new Error('Could not extract text from API response');
        }

        let jsonString = responseText.replace(/```json|```/g, '').trim();

        const jsonMatch = jsonString.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        }

        console.log("Attempting to parse JSON:", jsonString);

        questions = JSON.parse(jsonString);

        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('Invalid question format');
        }

        console.log("Parsed questions:", questions);
      } catch (parseError) {
        console.error("Error parsing questions:", parseError);
        console.log("Failed to parse response from Gemini API");

        questions = [
          {
            question: "What is the capital of France?",
            options: ["Paris", "London", "Berlin", "Rome"],
            correctAnswer: 0,
            explanation: "Paris is the capital city of France."
          },
          {
            question: "Which planet is known as the Red Planet?",
            options: ["Earth", "Mars", "Venus", "Jupiter"],
            correctAnswer: 1,
            explanation: "Mars appears reddish due to iron oxide (rust) on its surface."
          },
          {
            question: "What is 2+2?",
            options: ["3", "4", "5", "22"],
            correctAnswer: 1,
            explanation: "2+2 equals 4 in basic arithmetic."
          },
          {
            question: "Who wrote Romeo and Juliet?",
            options: ["Charles Dickens", "Jane Austen", "William Shakespeare", "Mark Twain"],
            correctAnswer: 2,
            explanation: "William Shakespeare wrote the tragedy Romeo and Juliet."
          },
          {
            question: "What is the chemical symbol for water?",
            options: ["Wa", "H2O", "CO2", "O2"],
            correctAnswer: 1,
            explanation: "H2O represents two hydrogen atoms and one oxygen atom."
          }
        ];
        console.log("Using fallback questions");
      }

      const addPromises = [];
      for (let i = 0; i < questions.length; i++) {
        addPromises.push(
          addDoc(quizCollection, {
            ...questions[i],
            order: i
          })
        );
      }

      await Promise.all(addPromises);
      console.log("Questions added to Firestore");

      await update(ref(rtdb, `groups/${groupId}/quiz`), {
        status: 'ready',
      });

      console.log("Quiz generated successfully with", questions.length, "questions");

    } catch (error) {
      console.error("Error generating quiz:", error);
      await update(ref(rtdb, `groups/${groupId}/quiz`), {
        status: 'error',
        errorMessage: error.message
      });
    }

    setLoading(false);
  }

  async function startQuiz() {
    await update(ref(rtdb, `groups/${groupId}/quiz`), {
      status: 'active',
      currentQuestion: 0,
      timeLeft: 30,
      showResults: false,
      startedAt: new Date().toISOString(),
      countdownToStart: null
    });

    await remove(ref(rtdb, `groups/${groupId}/readyUsers`));
    setUserReady(false);

    await remove(ref(rtdb, `groups/${groupId}/scores`));

    console.log("Quiz started!");
  }

  async function handleAnswer(optionIndex) {
    if (quizStatus !== 'active' || selectedOption !== null) return;

    setSelectedOption(optionIndex);

    const answerRef = ref(rtdb, `groups/${groupId}/answers/${currentQuestion}/${currentUser}`);
    await set(answerRef, {
      userId: currentUser,
      answer: optionIndex,
      timestamp: new Date().toISOString()
    });

    if (quizData[currentQuestion]?.correctAnswer === optionIndex) {
      const userScoreRef = ref(rtdb, `groups/${groupId}/scores/${currentUser}`);
      const userScore = scores[currentUser] || 0;
      await set(userScoreRef, userScore + 1);

      console.log(`User ${currentUser} got question ${currentQuestion} correct! New score: ${userScore + 1}`);
    }
  }

  async function nextQuestion() {
    if (currentQuestion < quizData.length - 1) {
      await update(ref(rtdb, `groups/${groupId}/quiz`), {
        currentQuestion: currentQuestion + 1,
        timeLeft: 30
      });
      setSelectedOption(null);
    } else {
      await update(ref(rtdb, `groups/${groupId}/quiz`), {
        status: 'completed',
        showResults: true
      });
    }
  }

  function renderUserScore() {
    const userScore = scores[currentUser] || 0;
    return (
      <div className="mb-4 text-center">
        <div className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-800">
          Your Score: {userScore} {userScore === 1 ? 'point' : 'points'}
        </div>
      </div>
    );
  }

  function renderScoreboard() {
    const sortedScores = Object.entries(scores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([userId, score]) => ({
        userId,
        score,
        name: participants.find(p => p.userId === userId)?.displayName || userId.substring(0, 5)
      }));

    return (
      <div className="bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300 text-black">
        <h3 className="text-2xl font-bold mb-4 text-center">Points</h3>
        <div className="space-y-3">
          {sortedScores.length > 0 ? (
            sortedScores.map((entry, index) => (
              <div key={entry.userId} className="flex justify-between items-center bg-white p-2 rounded shadow-md">
                <div className="flex items-center">
                  <span className="mr-3 font-bold text-lg">{index + 1}.</span>
                  <span className="text-lg">{entry.name}</span>
                </div>
                <span className="font-semibold text-lg">{entry.score} points</span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 text-lg">No scores yet</div>
          )}
        </div>
      </div>
    );
  }


  function renderReadyStatus() {
    const readyCount = Object.keys(readyUsers).length;

    return (
      <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Ready Status ({readyCount}/{participants.length})
        </h3>

        <div className="flex flex-wrap gap-3 justify-center">
          {participants.map((participant) => {
            const isReady = readyUsers[participant.userId];
            return (
              <div
                key={participant.userId}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isReady
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-300 text-gray-800"
                  }`}
              >
                {participant.displayName || participant.userId.substring(0, 5)}
                {isReady ? " ✓" : ""}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={toggleReady}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${userReady
              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
              : "bg-green-500 hover:bg-green-600 text-white shadow-lg"
              }`}
          >
            {userReady ? "Not Ready" : "I'm Ready"}
          </button>

          <div className="text-md text-gray-700 font-medium">
            {readyCount}/{participants.length} users ready
          </div>
        </div>

        {countdownToStart !== null && (
          <div className="mt-6 text-center">
            <div className="text-3xl font-bold text-purple-600 animate-pulse">
              Quiz starting in {countdownToStart}...
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderQuizControls() {
    if (quizStatus === "inactive") {
      return (
        <div className="text-center py-8 bg-gray-100 rounded-lg shadow-md">
          <p className="mb-4 text-lg text-gray-800 font-medium">
            No active quiz. Click below to generate a new quiz.
          </p>
          <button
            onClick={generateNewQuiz}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-md transition-all duration-300"
          >
            Generate New Quiz
          </button>
        </div>
      );
    }

    if (quizStatus === "error") {
      return (
        <div className="text-center py-8 bg-red-100 rounded-lg shadow-md">
          <p className="mb-4 text-lg text-red-700 font-medium">
            There was an error generating the quiz. Please try again.
          </p>
          <button
            onClick={generateNewQuiz}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-md transition-all duration-300"
          >
            Retry
          </button>
        </div>
      );
    }

    if (quizStatus === "generating") {
      return (
        <div className="text-center py-8 bg-gray-100 rounded-lg shadow-md">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Generating quiz questions...</p>
        </div>
      );
    }

    if (quizStatus === "ready") {
      return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🎉 Quiz is Ready!
          </h3>
          {renderReadyStatus()}
          <div className="mt-6 text-center">
            <button
              onClick={startQuiz}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold shadow-md transition-all duration-300"
            >
              Start Quiz Now 🚀
            </button>
            <p className="text-md text-gray-500 mt-2">
              Use this button to start the quiz immediately.
            </p>
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Live Quiz: {groupId}</h2>

      <div className="mb-4 p-3 bg-gray-50 border rounded-md text-xs text-gray-600">
        <p>Status: {quizStatus} | Questions: {quizData.length} | Current: {currentQuestion + 1}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Participants ({participants.length})</h3>
        <div className="flex flex-wrap gap-2">
          {participants.map(participant => (
            <div key={participant.userId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {participant.displayName || participant.userId.substring(0, 5)}
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700">Loading quiz...</p>
        </div>
      ) : (
        <>
          {!['active', 'completed'].includes(quizStatus) && renderQuizControls()}
          {quizStatus === 'active' && renderUserScore()}
          {quizStatus === 'active' && quizData.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              {timeLeft !== null && (
                <div className="mb-4 text-center">
                  <div className={`inline-block px-4 py-2 rounded-full text-lg font-semibold ${timeLeft <= 10 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>Time left: {timeLeft}s</div>
                </div>
              )}
              <h3 className="text-xl font-semibold mb-4 text-gray-900">{quizData[currentQuestion]?.question}</h3>
              <div className="space-y-3">
                {quizData[currentQuestion]?.options?.map((option, index) => {
                  const isSelected = selectedOption === index;
                  let bgColor = "border border-gray-400 bg-white hover:bg-gray-100 text-black";
                  if (isSelected) {
                    bgColor = "bg-blue-500 text-white font-bold";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedOption !== null}
                      className={`block w-full p-4 text-left rounded-lg transition font-medium ${bgColor}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {selectedOption !== null && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg text-gray-800">
                  <div className="font-semibold mb-1">
                    {selectedOption === quizData[currentQuestion]?.correctAnswer ? '✓ Correct! (+1 point)' : '✗ Incorrect'}
                  </div>
                  <div><strong>Explanation:</strong> {quizData[currentQuestion]?.explanation}</div>
                  <button
                    onClick={nextQuestion}
                    className={`mt-4 px-6 py-2 rounded-md text-white font-medium transition shadow-md hover:shadow-lg ${currentQuestion < quizData.length - 1 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {currentQuestion < quizData.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </button>
                </div>
              )}
            </div>
          )}
          {(quizStatus === 'completed' || showResults) && (
            <div className="mt-6">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Quiz Results</h3>
                {renderScoreboard()}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => update(ref(rtdb, `groups/${groupId}/quiz`), { status: 'inactive' })}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition"
                  >
                    Start New Quiz
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Question Review</h3>
              {quizData.map((question, qIndex) => (
                <div key={qIndex} className="bg-gray-100 p-4 rounded-lg shadow">
                  <h4 className="font-semibold mb-2 text-black">{qIndex + 1}. {question.question}</h4>
                  <div className="space-y-2">
                    {question.options?.map((option, oIndex) => (
                      <div key={oIndex} className={`p-3 rounded-md text-black ${question.correctAnswer === oIndex ? 'bg-green-200 border-l-4 border-green-600' : 'bg-gray-200'}`}>
                        {option} {question.correctAnswer === oIndex && '✓'}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-blue-200 rounded text-sm text-gray-900">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <div className="mt-6 text-center">
        <button
          onClick={() => update(ref(rtdb, `groups/${groupId}/quiz`), { status: 'inactive' })}
          className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400 transition"
        >
          Reset Quiz
        </button>
      </div>
    </div>
  );
}