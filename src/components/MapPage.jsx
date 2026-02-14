import { useRef, useState, useEffect } from 'react';
import ValentineARCamera from './ValentineARCamera';

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

  // Chocolate game state
  const [chocolateCount, setChocolateCount] = useState(1);
  const [chocolateClicks, setChocolateClicks] = useState(0);
  const [showChocolateCard, setShowChocolateCard] = useState(false);
  const [isChocolateSpreading, setIsChocolateSpreading] = useState(false);
  const [chocolateSpreadAnimate, setChocolateSpreadAnimate] = useState(false);
  const [chocolateSpreadOrigin, setChocolateSpreadOrigin] = useState({ x: 0, y: 0 });
  const [spreadChocolates, setSpreadChocolates] = useState([]);
  const closeBtnRef = useRef(null);

  // Hug Day carousel state
  const [hugStep, setHugStep] = useState(0);

  // Kiss Day state
  const [isKissing, setIsKissing] = useState(false);
  const [kissCount, setKissCount] = useState(0);

  // Valentine's Day AR Camera state
  const [showARCamera, setShowARCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceDetectionModel, setFaceDetectionModel] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);

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
      // Reset chocolate game state
      setChocolateCount(1);
      setChocolateClicks(0);
      setShowChocolateCard(false);
      setIsChocolateSpreading(false);
      setChocolateSpreadAnimate(false);
      setSpreadChocolates([]);
      // Reset hug carousel
      setHugStep(0);
      // Reset kiss state
      setIsKissing(false);
      setKissCount(0);
    }
  };

  const closeModal = () => {
    setSelectedDay(null);
    setQuizAnswer('');
    setQuizCorrect(false);
    setShowTryAgain(false);
    // Reset chocolate game state
    setChocolateCount(1);
    setChocolateClicks(0);
    setShowChocolateCard(false);
    setIsChocolateSpreading(false);
    setChocolateSpreadAnimate(false);
    setSpreadChocolates([]);
    // Reset hug carousel
    setHugStep(0);
    // Reset kiss state
    setIsKissing(false);
    setKissCount(0);
    // Stop camera and reset AR state
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowARCamera(false);
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

  const handleChocolateClick = () => {
    // Prevent clicking if card is already showing or after 3 clicks
    if (showChocolateCard || isChocolateSpreading || chocolateClicks >= 3) return;

    const newClicks = chocolateClicks + 1;
    setChocolateClicks(newClicks);
    setChocolateCount((prev) => prev + 1);

    // After 3rd click, spread chocolates from the Close button,
    // then show the success popup centered on top.
    if (newClicks === 3) {
      // Determine origin (near the Close button). Fallback to center of viewport.
      const rect = closeBtnRef.current?.getBoundingClientRect?.();
      const origin = rect
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : { x: window.innerWidth / 2, y: window.innerHeight / 2 };

      setChocolateSpreadOrigin(origin);

      // Generate a stable set of chocolate positions for the spread layer.
      const viewportArea = window.innerWidth * window.innerHeight;
      const chocolatesNeeded = Math.floor(viewportArea / (55 * 55));
      const count = Math.min(240, Math.max(60, chocolatesNeeded));

      const chocolates = Array.from({ length: count }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 360,
        s: 0.7 + Math.random() * 0.8,
        o: 0.55 + Math.random() * 0.45
      }));
      setSpreadChocolates(chocolates);

      setIsChocolateSpreading(true);
      setChocolateSpreadAnimate(false);
      requestAnimationFrame(() => setChocolateSpreadAnimate(true));

      // Show the popup after the spread completes.
      // Match popup timing to the spread animation duration.
      window.setTimeout(() => setShowChocolateCard(true), 1750);
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

          {/* Chocolate Day spread overlay (must be OUTSIDE the transformed card) */}
          {selectedDay.day === 3 && isChocolateSpreading && (
            <div
              className="fixed inset-0"
              style={{
                zIndex: 70,
                transform: `scale(${chocolateSpreadAnimate ? 1 : 0.02})`,
                transformOrigin: `${chocolateSpreadOrigin.x}px ${chocolateSpreadOrigin.y}px`,
                opacity: chocolateSpreadAnimate ? 1 : 0,
                transition:
                  'transform 1500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 650ms ease-out',
                background: 'rgba(255, 255, 255, 0.35)',
                backdropFilter: 'blur(2px)',
                willChange: 'transform, opacity',
                pointerEvents: 'none' // prevent accidental modal close while spreading
              }}
            >
              {spreadChocolates.map((c, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                    transform: `translate(-50%, -50%) rotate(${c.r}deg) scale(${c.s})`,
                    opacity: c.o,
                    fontSize: '3.25rem',
                    filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.15))'
                  }}
                >
                  🍫
                </div>
              ))}
            </div>
          )}

          {/* Chocolate Day success popup (centered on top of spread) */}
          {selectedDay.day === 3 && showChocolateCard && (
            <div
              className="fixed inset-0 flex items-center justify-center"
              style={{ zIndex: 80 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl p-8 text-gray-800 shadow-2xl max-w-md mx-4 border border-pink-100">
                {/* subtle color scheme like the main modal card */}
                <div className="text-6xl mb-4">🍫</div>
                <p className="text-3xl font-bold mb-3 text-pink-600">
                  Happy Chocolate Day! 🍫
                </p>
                <p className="text-lg text-gray-700">
                  You filled the screen with sweetness! Just like you fill my life with joy 💕
                </p>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={closeModal}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-bold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            className={`bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl transform transition-all`}
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
                      <p className="text-lg font-medium mb-3">
                        Yes! It was in the classroom at KJSCE 🌹🎓
                      </p>
                      <p className="text-sm opacity-90">
                        I was in second year... There was some event in college, and we were at the top floor. That's where I gave you the rose 🌹
                      </p>
                      <p className="text-sm mt-2 opacity-90">
                        That special moment will always be in my heart ✨
                      </p>
                    </div>
                  )}
                </div>
              ) : selectedDay.day === 3 ? (
                // Chocolate Day - Doubling Game
                <div className="mb-6">
                  <div className="relative z-30">
                    <p className="text-lg font-semibold text-gray-700 mb-4">
                      Click the chocolate to make more! 🍫
                    </p>
                    <p className="text-sm text-gray-500">
                      Chocolates: {chocolateCount}
                    </p>
                  </div>

                  {/* Chocolates grow horizontally with clicks */}
                  <div className="flex items-center justify-center my-6">
                    <div className="flex items-center gap-3">
                      {Array.from({ length: chocolateCount }).map((_, idx) => {
                        const disabled = isChocolateSpreading || chocolateClicks >= 3;
                        if (idx === 0) {
                          return (
                            <button
                              key={idx}
                              onClick={handleChocolateClick}
                              disabled={disabled}
                              className={`text-7xl transform transition-transform duration-200 ${
                                disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                              }`}
                              aria-label="Make more chocolates"
                            >
                              🍫
                            </button>
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className={`text-7xl transition-opacity duration-200 ${disabled ? 'opacity-50' : 'opacity-90'}`}
                            aria-hidden="true"
                          >
                            🍫
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : selectedDay.day === 4 ? (
                // Teddy Day - Cute Video
                <div className="mb-6">
                  <div className={`bg-gradient-to-br ${selectedDay.color} rounded-2xl p-6 text-white mb-4`}>
                    <p className="text-2xl font-bold mb-2">
                      You're my cuddly teddy! 🧸💕
                    </p>
                    <p className="text-sm opacity-90">
                      Just like this adorable teddy, you bring warmth and comfort to my life ✨
                    </p>
                  </div>

                  <div className="relative w-full" style={{ paddingBottom: '177.78%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-xl"
                      src="https://www.youtube.com/embed/mCkT9Cxb-k4"
                      title="Teddy Day Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : selectedDay.day === 5 ? (
                // Promise Day
                <div className="mb-6">
                  <img
                    src="/promise-day.jpg"
                    alt="Us"
                    className="w-full max-w-md mx-auto rounded-2xl shadow-xl mb-4"
                  />
                  <div className={`bg-gradient-to-br ${selectedDay.color} rounded-2xl p-6 text-white`}>
                    <p className="text-2xl font-bold mb-3">
                      Ahh Promise Day! 🤝
                    </p>
                    <p className="text-base leading-relaxed">
                      Don't worry, nothing surprising here but yeah... promises. We both know they haven't always been our strong suit. But let's make them mean something from now on? Not because it's Promise Day, but because we actually want to. Let's just keep our word to each other - that's it. ❤️
                    </p>
                  </div>
                </div>
              ) : selectedDay.day === 6 ? (
                // Hug Day - Carousel
                <div className="mb-6">
                  {(() => {
                    const hugImages = [
                      "https://www.shutterstock.com/image-vector/typography-slogan-bear-doll-couple-600nw-2279971169.jpg",
                      "https://i.pinimg.com/736x/67/60/34/676034d2557c0a622c66498a9d41fe97.jpg",
                      "https://i.pinimg.com/736x/f4/ed/53/f4ed53aee2ff97e8830a0fa0a64005b0.jpg",
                      "https://i.pinimg.com/736x/69/a1/43/69a143941513d3548cef632af5b504d3.jpg"
                    ];

                    const messages = [
                      "Here's a hug for you! 🤗",
                      "More hugs! 🤗💚",
                      "Even more hugs!! 🤗✨",
                      "And more more hugs!!! 🤗💕"
                    ];

                    if (hugStep < 4) {
                      return (
                        <>
                          <div className={`bg-gradient-to-br ${selectedDay.color} rounded-2xl p-6 text-white mb-4`}>
                            <p className="text-2xl font-bold">
                              {messages[hugStep]}
                            </p>
                          </div>

                          <img
                            src={hugImages[hugStep]}
                            alt={`Hug ${hugStep + 1}`}
                            className="w-full max-w-sm mx-auto rounded-2xl shadow-xl mb-4"
                          />

                          <div className="flex justify-between items-center gap-4">
                            <button
                              onClick={() => setHugStep(Math.max(0, hugStep - 1))}
                              disabled={hugStep === 0}
                              className={`px-6 py-2 rounded-full font-bold transition-colors ${
                                hugStep === 0
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              ← Back
                            </button>
                            <button
                              onClick={() => setHugStep(hugStep + 1)}
                              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold transition-colors"
                            >
                              Next →
                            </button>
                          </div>
                        </>
                      );
                    }

                    // Final step - show all hugs in grid
                    return (
                      <>
                        <div className={`bg-gradient-to-br ${selectedDay.color} rounded-2xl p-6 text-white mb-4`}>
                          <p className="text-2xl font-bold mb-2">
                            All the hugs! 🤗
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {hugImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Hug ${idx + 1}`}
                              className="w-full h-48 object-cover rounded-xl shadow-lg"
                            />
                          ))}
                        </div>

                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center mb-4">
                          <p className="text-gray-700 text-base">
                            Ah, but no amount of hugs are ever enough... 🤗💚
                          </p>
                        </div>

                        <button
                          onClick={() => setHugStep(0)}
                          className="w-full px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold transition-colors"
                        >
                          ← Start Over
                        </button>
                      </>
                    );
                  })()}
                </div>
              ) : selectedDay.day === 7 ? (
                // Kiss Day - Interactive Kissing
                <div className="mb-6">
                  <div className="relative">
                    <img
                      src={isKissing ? "/kiss-day-2.jpg" : "/kiss-day-1.jpg"}
                      alt="Kiss Day"
                      className="w-full max-w-md mx-auto rounded-2xl shadow-xl mb-4 transition-all duration-500"
                    />

                    {!isKissing && (
                      <div className="text-center">
                        <button
                          onClick={() => {
                            setIsKissing(true);
                            setKissCount(prev => prev + 1);
                            setTimeout(() => {
                              setIsKissing(false);
                            }, 2000);
                          }}
                          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                          💋 Kiss me!
                        </button>
                        {kissCount > 0 && (
                          <p className="text-gray-600 text-sm mt-3">
                            Kisses: {kissCount} 💕
                          </p>
                        )}
                      </div>
                    )}

                    {isKissing && (
                      <div className="text-center animate-pulse">
                        <p className="text-2xl font-bold text-pink-600">
                          😘 Mwah! 💋
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedDay.day === 8 ? (
                // Valentine's Day - AR Crown Filter
                <div className="mb-6">
                  {!showARCamera ? (
                    <>
                      <div className="text-8xl mb-4">{selectedDay.emoji}</div>
                      <div className={`bg-gradient-to-br ${selectedDay.color} rounded-2xl p-6 text-white mb-4`}>
                        <p className="text-2xl font-bold mb-3">
                          You're My Queen! 👑
                        </p>
                        <p className="text-base">
                          Click below to try on your royal crown! ✨
                        </p>
                      </div>
                      <button
                        onClick={() => setShowARCamera(true)}
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                      >
                        👑 Try Your Crown!
                      </button>
                    </>
                  ) : (
                    <ValentineARCamera onClose={() => setShowARCamera(false)} />
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
                ref={selectedDay.day === 3 ? closeBtnRef : undefined}
                onClick={closeModal}
                disabled={selectedDay.day === 3 && isChocolateSpreading && !showChocolateCard}
                className={`mx-auto block bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-bold transition-colors ${
                  selectedDay.day === 3 && isChocolateSpreading && !showChocolateCard ? 'opacity-50 cursor-not-allowed' : ''
                }`}
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
