import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { auth } from "./firebaseConfig";

import Auth from "./components/Auth";
import StartGame from "./pages/StartGame";
import LevelSelect from "./pages/LevelSelect";
import LevelPage from "./pages/LevelPage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        <div className="text-center">
          <div className="relative h-64 w-64 mx-auto">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ y: 200, opacity: 0 }}
                animate={{
                  y: [-100, -300],
                  opacity: [0, 1, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut",
                }}
              >
                <div
                  className="w-24 h-32 rounded-full shadow-2xl border-4 border-white/70 flex items-center justify-center text-5xl font-bold text-white"
                  style={{
                    backgroundColor: [
                      "#ef4444",
                      "#3b82f6",
                      "#fbbf24",
                      "#22c55e",
                      "#f97316",
                      "#a855f7",
                    ][i],
                  }}
                >
                  Balloon
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-6xl font-black text-white drop-shadow-2xl">
              Balloon Pop
            </h1>
            <p className="text-2xl text-white/90 mt-4 font-medium">
              Loading your game...
            </p>
          </motion.div>

          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-4 h-4 bg-white rounded-full"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={!user ? <Auth /> : <Navigate to="/start" />} />
      <Route
        path="/start"
        element={user ? <StartGame /> : <Navigate to="/" />}
      />
      <Route
        path="/levels"
        element={user ? <LevelSelect /> : <Navigate to="/" />}
      />
      <Route
        path="/level/:level"
        element={user ? <LevelPage /> : <Navigate to="/" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
