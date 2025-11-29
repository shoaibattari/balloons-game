import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { auth, db } from "../firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

function randPercent(min = 10, max = 90) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const COLOR_OPTIONS = [
  { name: "RED", hex: "#ef4444", text: "text-red-600" },
  { name: "BLUE", hex: "#3b82f6", text: "text-blue-600" },
  { name: "YELLOW", hex: "#fbbf24", text: "text-yellow-500" },
  { name: "GREEN", hex: "#22c55e", text: "text-green-600" },
  { name: "ORANGE", hex: "#f97316", text: "text-orange-600" },
];

const LEVEL_REQUIREMENTS = {
  1: 20,
  2: 30,
  3: 40,
  4: 50,
  5: 60,
  6: 70,
  7: 80,
  8: 90,
  9: 100,
  10: 120,
};
const LEVEL_TIMERS = {
  1: 60,
  2: 55,
  3: 50,
  4: 45,
  5: 40,
  6: 35,
  7: 30,
  8: 25,
  9: 20,
  10: 15,
};

export default function GameBoard({ level = 1 }) {
  const [balloons, setBalloons] = useState([]);
  const [score, setScore] = useState(0);
  const [correctHits, setCorrectHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(LEVEL_TIMERS[level] || 30);
  const [isFinished, setIsFinished] = useState(false);

  // Dynamic target color (changes during game for level 3+)
  const [target, setTarget] = useState(COLOR_OPTIONS[0]);

  const spawnTimer = useRef(null);
  const gameTimer = useRef(null);
  const targetChangeTimer = useRef(null);

  // Set initial target color
  useEffect(() => {
    if (level <= 2) {
      setTarget(COLOR_OPTIONS[(level - 1) % COLOR_OPTIONS.length]);
    } else {
      setTarget(
        COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]
      );
    }
  }, [level]);

  // Auto-change target color every 14–18 seconds (only level 3+ while running)
  useEffect(() => {
    if (!isRunning || level <= 2) {
      if (targetChangeTimer.current) clearInterval(targetChangeTimer.current);
      return;
    }

    targetChangeTimer.current = setInterval(() => {
      setTarget((prev) => {
        let newColor;
        do {
          newColor =
            COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
        } while (newColor.name === prev.name);
        return newColor;
      });
    }, 14000 + Math.random() * 4000); // 14–18 seconds

    return () => clearInterval(targetChangeTimer.current);
  }, [isRunning, level]);

  // Cleanup all timers
  useEffect(() => {
    return () => {
      clearInterval(spawnTimer.current);
      clearInterval(gameTimer.current);
      clearInterval(targetChangeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isFinished) return;
    endLevel();
    const timer = setTimeout(() => {
      window.location.href = "/levels";
    }, 3000);
    return () => clearTimeout(timer);
  }, [isFinished]);

  const start = () => {
    setScore(0);
    setCorrectHits(0);
    setMisses(0);
    setIsRunning(true);
    setIsFinished(false);
    setBalloons([]);
    setTimeLeft(LEVEL_TIMERS[level] || 30);

    // Fresh random target on start (for level 3+)
    if (level >= 3) {
      setTarget(
        COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]
      );
    }

    const spawnIntervalMs = Math.max(350, 1200 - level * 80);

    spawnTimer.current = setInterval(() => {
      const id = crypto.randomUUID();
      const x = randPercent();
      const colorObj =
        COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];

      setBalloons((prev) => [...prev, { id, x, color: colorObj }]);

      setTimeout(() => {
        setBalloons((prev) => prev.filter((b) => b.id !== id));
      }, 7000);
    }, spawnIntervalMs);

    gameTimer.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(gameTimer.current);
          clearInterval(spawnTimer.current);
          clearInterval(targetChangeTimer.current);
          setIsRunning(false);
          setIsFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const endLevel = async () => {
    clearInterval(spawnTimer.current);
    clearInterval(gameTimer.current);
    clearInterval(targetChangeTimer.current);
    setIsRunning(false);
    setBalloons([]);

    const session = {
      level,
      score,
      correctHits,
      misses,
      duration: LEVEL_TIMERS[level] || 30,
      targetColor: target.name,
      createdAt: serverTimestamp(),
    };

    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await addDoc(collection(userRef, "sessions"), session);
        if (score >= (LEVEL_REQUIREMENTS[level] || 20) && level < 10) {
          await updateDoc(userRef, { currentLevel: level + 1 });
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handlePop = (balloon) => {
    if (balloon.color.name === target.name) {
      setScore((s) => s + 10);
      setCorrectHits((c) => c + 1);
    } else {
      setMisses((m) => m + 1);
      setScore((s) => Math.max(0, s - 5));
    }
    setBalloons((b) => b.filter((x) => x.id !== balloon.id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-400 via-purple-400 to-pink-400 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-t from-sky-200/70 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="flex-none p-4 sm:p-6 bg-white/10 backdrop-blur-xl border-b-4 border-white/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center justify-items-center text-center">
          {/* Target Color */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <p className="text-white text-sm sm:text-base font-bold mb-1">
              Pop Only{" "}
              {level >= 3 && (
                <span className="text-yellow-300">(Changes!)</span>
              )}
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <motion.div
                key={target.hex}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-2xl border-4 border-white overflow-hidden"
                style={{ backgroundColor: target.hex }}
              >
                {level >= 3 && isRunning && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 rounded-full border-4 border-white/60 border-t-transparent"
                  />
                )}
              </motion.div>
              <motion.p
                key={target.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl font-black text-white drop-shadow-2xl"
              >
                {target.name}
              </motion.p>
            </div>
          </motion.div>

          {/* Timer */}
          <motion.div
            animate={timeLeft <= 10 && isRunning ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <p className="text-white/90 text-sm sm:text-lg font-bold">Time</p>
            <p
              className={`text-4xl sm:text-6xl font-black ${
                timeLeft <= 10 ? "text-red-500" : "text-white"
              } drop-shadow-lg`}
            >
              {timeLeft}
            </p>
          </motion.div>

          {/* Score */}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <p className="text-white/90 text-sm sm:text-lg font-bold">Score</p>
            <p className="text-4xl sm:text-6xl font-black text-yellow-400 drop-shadow-2xl">
              {score}
            </p>
          </motion.div>

          {/* Button */}
          <div className="w-full sm:w-auto">
            {!isRunning && !isFinished ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={start}
                className="w-full sm:w-auto px-8 py-4 sm:px-12 sm:py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl sm:text-2xl font-bold rounded-3xl shadow-2xl"
              >
                START LEVEL {level}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={endLevel}
                className="w-full sm:w-auto px-8 py-4 sm:px-12 sm:py-6 bg-red-600 hover:bg-red-700 text-white text-2xl sm:text-3xl font-bold rounded-3xl shadow-2xl"
              >
                END GAME
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 relative">
        <AnimatePresence>
          {balloons.map((b) => (
            <motion.div
              key={b.id}
              className="absolute cursor-pointer select-none z-50 touch-none"
              style={{ left: `${b.x}%`, transform: "translateX(-50%)" }}
              initial={{ bottom: "-30%", scale: 0, rotate: -60 }}
              animate={{ bottom: "140%", scale: 1, rotate: 60 }}
              transition={{ duration: 6.5, ease: "linear" }}
              exit={{
                scale: [1, 3, 0],
                opacity: 0,
                rotate: 1080,
                transition: { duration: 0.7 },
              }}
              onClick={() => handlePop(b)}
              whileTap={{ scale: 0.9 }}
            >
              <div className="relative">
                <div
                  className="w-24 h-32 sm:w-32 sm:h-44 md:w-36 md:h-48 rounded-full shadow-2xl border-4 sm:border-8 border-white/70 flex items-center justify-center"
                  style={{ backgroundColor: b.color.hex }}
                >
                  <p
                    className={`text-2xl sm:text-3xl md:text-4xl font-black ${b.color.text} drop-shadow-lg`}
                  >
                    {b.color.name}
                  </p>
                </div>
                <div className="absolute top-full left-1/2 w-1 sm:w-2 h-32 sm:h-56 bg-gradient-to-b from-gray-600 to-black -translate-x-1/2 origin-top animate-sway" />
                <div className="absolute top-full left-1/2 w-6 sm:w-8 h-6 sm:h-8 bg-red-900 rounded-full -translate-x-1/2 shadow-xl" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* Bottom Stats */}
      {!isFinished && (
        <footer className="p-4 sm:p-6 bg-white/20 backdrop-blur-xl border-t-4 border-white/30 text-center">
          <p className="text-white text-lg sm:text-2xl font-bold">
            Correct: <span className="text-green-400">{correctHits}</span> •
            Wrong: <span className="text-red-400">{misses}</span>
          </p>
        </footer>
      )}

      {/* Level Complete */}
      {isFinished && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 150 }}
            className="bg-white rounded-3xl p-8 sm:p-16 text-center shadow-2xl max-w-md w-full"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl sm:text-9xl mb-4 sm:mb-6"
            >
              Trophy
            </motion.div>
            <h2 className="text-4xl sm:text-7xl font-black text-gray-800">
              Level {level} Complete!
            </h2>
            <p className="text-6xl sm:text-9xl font-black text-green-600 mt-6 sm:mt-8">
              {score}
            </p>
            <p className="text-2xl sm:text-4xl font-bold text-purple-600 mt-6 sm:mt-10">
              Next → {COLOR_OPTIONS[level % COLOR_OPTIONS.length].name}
            </p>
            <p className="text-lg sm:text-2xl text-gray-600 mt-4 sm:mt-6">
              Redirecting...
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
