import { useNavigate } from "react-router-dom";
import useUserProgress from "../hooks/useUserProgress";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { motion } from "framer-motion";

export default function LevelSelect() {
  const navigate = useNavigate();
  // User ka current unlocked level aur loading state le rahe hain
  const { level: unlockedLevel, loading } = useUserProgress();

  // Jab tak data load ho raha hai, loading screen dikhao
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-sky-400 to-sky-600 flex items-center justify-center">
        <div className="text-white text-3xl font-bold animate-pulse">
          Balloons load ho rahe hain...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 via-purple-500 to-pink-500 relative overflow-hidden">
      {/* Background mein dheere dheere chalte clouds */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-48 h-32 bg-white rounded-full opacity-30"
            initial={{ x: -200 }}
            animate={{ x: "120vw" }}
            transition={{
              duration: 50 + i * 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ top: `${10 + i * 15}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6 flex flex-col items-center pt-10">
        {/* Title aur Logout button */}
        <div className="w-full max-w-4xl flex justify-between items-center mb-10">
          <motion.h1
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl font-bold text-white drop-shadow-2xl"
            style={{ fontFamily: "Comic Neue, cursive" }}
          >
            Balloon Pop!
          </motion.h1>

          <button
            onClick={() => signOut(auth)}
            className="px-6 py-3 bg-red-600 cursor-pointer hover:bg-red-700 text-white font-bold rounded-full shadow-lg hover:scale-105 transition"
          >
            Logout
          </button>
        </div>

        {/* Har level ek balloon ki shape mein */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-8 max-w-5xl">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => {
            const isUnlocked = lvl <= unlockedLevel; // Check karo level khula hai ya nahi

            return (
              <motion.button
                key={lvl}
                onClick={() => isUnlocked && navigate(`/level/${lvl}`)}
                disabled={!isUnlocked}
                whileHover={isUnlocked ? { y: -25, scale: 1.25 } : {}}
                whileTap={isUnlocked ? { scale: 0.9 } : {}}
                initial={{ y: 400, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: lvl * 0.06 }}
                // Balloon ka real shape aur colors
                className={`relative w-28 h-36 flex items-center justify-center text-3xl font-bold rounded-full shadow-2xl 
                  ${
                    isUnlocked
                      ? "bg-linear-to-b from-yellow-400 via-red-500 to-pink-500 text-white hover:from-purple-500 hover:to-blue-600 cursor-pointer"
                      : "bg-gray-400 text-gray-700 cursor-not-allowed"
                  }`}
                style={{
                  clipPath:
                    "ellipse(50% 40% at 50% 50%), ellipse(50% 45% at 50% 85%)",
                }}
              >
                {lvl}

                {/* Balloon ki dori (string) sirf unlocked levels pe */}
                {isUnlocked && (
                  <div className="absolute bottom-0 w-1 h-24 bg-white opacity-60 translate-y-16" />
                )}

                {/* Chamak dar shine effect */}
                {isUnlocked && (
                  <div className="absolute inset-0 rounded-full bg-white opacity-40 blur-xl" />
                )}

                {/* Locked levels pe tala (lock) emoji */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    🔒
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Neeche progress bar style info box */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 bg-white bg-opacity-95 px-12 py-8 rounded-3xl shadow-2xl text-center"
        >
          <p className="text-3xl font-bold text-purple-700">
            Unlocked Levels:{" "}
            <span className="text-5xl text-pink-600">{unlockedLevel}</span>/10
          </p>
          <p className="text-xl text-gray-700 mt-3">
            Aur balloons phodo aur mazeed levels kholo!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
