import { useState, useEffect } from 'react';

const valentineWeek = [
  { day: 1, date: '2026-02-07', name: 'Rose Day', emoji: '🌹', color: 'from-red-400 to-pink-400' },
  { day: 2, date: '2026-02-08', name: 'Propose Day', emoji: '💍', color: 'from-purple-400 to-pink-400' },
  { day: 3, date: '2026-02-09', name: 'Chocolate Day', emoji: '🍫', color: 'from-amber-600 to-yellow-600' },
  { day: 4, date: '2026-02-10', name: 'Teddy Day', emoji: '🧸', color: 'from-amber-400 to-orange-400' },
  { day: 5, date: '2026-02-11', name: 'Promise Day', emoji: '🤝', color: 'from-blue-400 to-cyan-400' },
  { day: 6, date: '2026-02-12', name: 'Hug Day', emoji: '🤗', color: 'from-green-400 to-emerald-400' },
  { day: 7, date: '2026-02-13', name: 'Kiss Day', emoji: '💋', color: 'from-pink-500 to-rose-500' },
  { day: 8, date: '2026-02-14', name: "Valentine's Day", emoji: '💕', color: 'from-red-500 to-pink-600' }
];

const MapPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizCorrect, setQuizCorrect] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);

  // For testing, you can uncomment this to simulate different dates
  // const [currentDate, setCurrentDate] = useState('2026-02-09');

  const isUnlocked = (checkpointDate) => {
    return currentDate >= checkpointDate;
  };

  const handleCheckpointClick = (checkpoint) => {
    if (isUnlocked(checkpoint.date)) {
      setSelectedDay(checkpoint);
      // Reset quiz state when opening modal
      setQuizAnswer('');
      setQuizCorrect(false);
      setShowTryAgain(false);
    }
  };

  const closeModal = () => {
    setSelectedDay(null);
    setQuizAnswer('');
    setQuizCorrect(false);
    setShowTryAgain(false);
  };

  const handleQuizAnswer = (answer) => {
    setQuizAnswer(answer);
    if (answer === 'Classroom') {
      setQuizCorrect(true);
      setShowTryAgain(false);
    } else {
      setShowTryAgain(true);
      setTimeout(() => setShowTryAgain(false), 2000);
    }
  };

  // SVG path for the journey route (winding path)
  const pathData = "M 100 100 Q 200 80, 300 120 T 500 100 Q 600 140, 700 100 T 900 120";

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-6xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            💕
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-6xl font-bold text-pink-600 mb-4">
          Our Valentine's Journey 💖
        </h1>
        <p className="text-xl text-gray-700">
          8 days of love, surprises, and sweet memories
        </p>
      </div>

      {/* Map Container */}
      <div className="max-w-6xl mx-auto relative">
        {/* The Journey Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path
            d={pathData}
            stroke="url(#pathGradient)"
            strokeWidth="4"
            fill="none"
            strokeDasharray="10,5"
            opacity="0.3"
          />
        </svg>

        {/* Checkpoints Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10 py-12">
          {valentineWeek.map((checkpoint, index) => {
            const unlocked = isUnlocked(checkpoint.date);

            return (
              <div
                key={checkpoint.day}
                className="flex flex-col items-center"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Checkpoint Circle */}
                <button
                  onClick={() => handleCheckpointClick(checkpoint)}
                  disabled={!unlocked}
                  className={`
                    relative w-32 h-32 rounded-full flex items-center justify-center
                    transform transition-all duration-300 hover:scale-110
                    ${unlocked
                      ? `bg-gradient-to-br ${checkpoint.color} shadow-2xl cursor-pointer animate-pulse-slow`
                      : 'bg-gray-300 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-1">{checkpoint.emoji}</div>
                    <div className="text-xs font-bold text-white drop-shadow-lg">
                      Day {checkpoint.day}
                    </div>
                  </div>

                  {/* Lock icon for locked checkpoints */}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                      <span className="text-4xl">🔒</span>
                    </div>
                  )}

                  {/* Glow effect for unlocked */}
                  {unlocked && (
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${checkpoint.color} opacity-50 blur-xl -z-10`}></div>
                  )}
                </button>

                {/* Checkpoint Name */}
                <div className="mt-4 text-center">
                  <h3 className={`font-bold text-lg ${unlocked ? 'text-pink-600' : 'text-gray-500'}`}>
                    {checkpoint.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(checkpoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for selected day */}
      {selectedDay && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden"
          onClick={closeModal}
        >
          {/* Rose shower animation for Rose Day */}
          {selectedDay.day === 1 && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-3xl animate-fall"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                    opacity: 0.8
                  }}
                >
                  🌹
                </div>
              ))}
            </div>
          )}

          <div
            className={`bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold text-pink-600 mb-2">
                {selectedDay.name}
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Day {selectedDay.day} of our Valentine's Journey
              </p>

              {/* Custom content for each day */}
              {selectedDay.day === 1 ? (
                // Rose Day special content
                <div className="mb-6">
                  <img
                    src="https://media1.tenor.com/m/5W3O1UxUHcIAAAAC/cat-holding-a-rose-hand-emoji-charles-scarlet-wing.gif"
                    alt="Rose for you"
                    className="w-full max-w-xs mx-auto rounded-2xl shadow-xl mb-4"
                  />
                  <div className={`bg-gradient-to-br ${selectedDay.color} rounded-2xl p-6 text-white`}>
                    <p className="text-lg font-medium">
                      A rose for you! 🌹
                    </p>
                    <p className="text-sm mt-2 opacity-90">
                      The beginning of our special week together 💕
                    </p>
                  </div>
                </div>
              ) : selectedDay.day === 2 ? (
                // Propose Day - Quiz
                <div className="mb-6">
                  <div className="text-6xl mb-4">{selectedDay.emoji}</div>

                  {!quizCorrect ? (
                    <div>
                      <p className="text-lg font-semibold text-gray-700 mb-6">
                        Where was the first time I proposed to you with a rose? 🌹
                      </p>

                      <div className="space-y-3 mb-4">
                        {['Powai', 'Classroom', 'Bedroom'].map((option) => (
                          <button
                            key={option}
                            onClick={() => handleQuizAnswer(option)}
                            className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
                              quizAnswer === option
                                ? option === 'Classroom'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-red-400 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>

                      {showTryAgain && (
                        <p className="text-red-500 font-semibold animate-pulse">
                          Try again! 💭
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className={`bg-gradient-to-br ${selectedDay.color} rounded-2xl p-6 text-white`}>
                      <p className="text-2xl font-bold mb-3">
                        Correct! 💕
                      </p>
                      <p className="text-lg font-medium">
                        Yes! It was in the classroom where our love story truly began 🎓💍
                      </p>
                      <p className="text-sm mt-3 opacity-90">
                        That moment will always be special to me ✨
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Placeholder for other days
                <div className="mb-6">
                  <div className="text-8xl mb-4">{selectedDay.emoji}</div>
                  <div className={`bg-gradient-to-br ${selectedDay.color} rounded-2xl p-6 text-white`}>
                    <p className="text-lg font-medium">
                      🎁 Your special surprise for today will be revealed here!
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={closeModal}
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testing Controls (remove in production) */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-50">
        <p className="text-xs text-gray-500 mb-2">Testing Controls:</p>
        <input
          type="date"
          value={currentDate}
          onChange={(e) => setCurrentDate(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">
          Change date to unlock checkpoints
        </p>
      </div>
    </div>
  );
};

export default MapPage;
