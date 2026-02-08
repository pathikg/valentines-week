import { useState, useRef, useMemo } from 'react';

const ProposalPage = ({ onAccept }) => {
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [noButtonSize, setNoButtonSize] = useState(1);
  const [yesButtonSize, setYesButtonSize] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const noButtonRef = useRef(null);

  // Generate hearts once and keep them static
  const backgroundHearts = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 4
    }));
  }, []);

  const phrases = [
    "Are you sure? 🥺",
    "Really? 💔",
    "Please reconsider! 🙏",
    "Don't break my heart! 💘",
    "Give me a chance! 🌹",
    "Pretty please? 🥹",
    "You're breaking my heart! 😢",
    "One more chance? 💕",
    "Think about it! 💭",
    "Last chance! 🙈"
  ];

  const [currentPhrase, setCurrentPhrase] = useState("No");

  const handleNoHover = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts < 10) {
      // Make radius responsive to screen size
      const isMobile = window.innerWidth < 768;
      const minRadius = isMobile ? 80 : 150; // Smaller radius on mobile
      const maxRadius = isMobile ? 120 : 200; // Reduced max radius to stay in viewport

      const angle = Math.random() * Math.PI * 2;
      const distance = minRadius + Math.random() * (maxRadius - minRadius);

      const newX = Math.cos(angle) * distance;
      const newY = Math.sin(angle) * distance;

      setNoButtonPosition({ x: newX, y: newY });

      // Shrink the No button
      setNoButtonSize(prev => Math.max(0.3, prev - 0.1));

      // Grow the Yes button
      setYesButtonSize(prev => Math.min(2.5, prev + 0.2));

      // Change the phrase
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setCurrentPhrase(randomPhrase);
    } else {
      // After 10 attempts, hide behind Yes button
      setNoButtonPosition({ x: 0, y: 0 });
      setNoButtonSize(0.5);
      setCurrentPhrase("No option! 😏");
    }
  };

  const handleYesClick = () => {
    setShowCelebration(true);
    setTimeout(() => {
      onAccept();
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating hearts background */}
      <div className="absolute inset-0 pointer-events-none">
        {backgroundHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute text-4xl opacity-20 animate-float"
            style={{
              left: `${heart.left}%`,
              top: `${heart.top}%`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-6">
              <img
                src="https://media.tenor.com/DbfwouTfspoAAAAM/tripulaciones-de-terry.gif"
                alt="Celebration"
                className="w-64 h-64 md:w-96 md:h-96 mx-auto rounded-2xl shadow-2xl"
              />
            </div>
            <div className="bg-white/95 backdrop-blur-md rounded-3xl px-12 py-8 shadow-2xl">
              <h2 className="text-6xl font-bold text-pink-600 heart-beat mb-4">
                YAYY! 💕
              </h2>
              <p className="text-2xl text-pink-500 font-semibold">
                I knew you'd say yes!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center relative z-10">
        <div className="text-8xl mb-8 animate-bounce-slow">💝</div>

        <h1 className="text-5xl md:text-6xl font-bold text-pink-600 mb-6 leading-tight">
          Will you be my Valentine?
        </h1>

        <p className="text-xl text-gray-600 mb-12">
          This Valentine's week is going to be special... ✨
        </p>

        {/* Before first attempt - side by side layout */}
        {attempts === 0 ? (
          <div className="relative h-32 flex gap-6 justify-center items-center flex-wrap my-8">
            <button
              onClick={handleYesClick}
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-12 py-4 rounded-full text-2xl font-bold hover:from-pink-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Yes! 💖
            </button>

            <button
              ref={noButtonRef}
              onMouseEnter={handleNoHover}
              onTouchStart={handleNoHover}
              onClick={(e) => {
                e.preventDefault();
                handleNoHover();
              }}
              className="bg-gray-300 text-gray-700 px-12 py-4 rounded-full text-2xl font-bold hover:bg-gray-400 transition-all duration-300 shadow-lg"
            >
              No
            </button>
          </div>
        ) : (
          /* After first attempt - centered Yes, moving No */
          <div className="relative h-32 flex items-center justify-center my-8">
            {/* Yes button - always centered */}
            <button
              onClick={handleYesClick}
              style={{
                transform: `scale(${yesButtonSize})`,
                transformOrigin: 'center center',
                zIndex: attempts >= 10 ? 30 : 20
              }}
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-12 py-4 rounded-full text-2xl font-bold hover:from-pink-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl relative"
            >
              Yes! 💖
            </button>

            {/* No button - moves around */}
            <button
              ref={noButtonRef}
              onMouseEnter={handleNoHover}
              onTouchStart={handleNoHover}
              onClick={(e) => {
                e.preventDefault();
                handleNoHover();
              }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${noButtonPosition.x}px), calc(-50% + ${noButtonPosition.y}px)) scale(${noButtonSize})`,
                transition: 'all 0.3s ease-out',
                transformOrigin: 'center center',
                zIndex: attempts >= 10 ? 10 : 20
              }}
              className="bg-gray-300 text-gray-700 px-12 py-4 rounded-full text-2xl font-bold hover:bg-gray-400 transition-all duration-300 shadow-lg"
            >
              {currentPhrase}
            </button>
          </div>
        )}

        {attempts >= 10 && (
          <p className="text-lg text-pink-600 font-bold mb-4 animate-pulse">
            You have no option now! Just say YES! 😂💕
          </p>
        )}

        <p className="text-sm text-gray-400 mt-8 italic">
          {attempts === 0
            ? "Hint: The \"No\" button is a bit shy... 😏"
            : attempts < 10
            ? `Attempts: ${attempts}/10 - The "No" button is running away! 🏃‍♂️`
            : "The \"No\" button has given up! 🎯"}
        </p>
      </div>
    </div>
  );
};

export default ProposalPage;
