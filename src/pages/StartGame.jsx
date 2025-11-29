import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function StartGame() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 via-pink-500 to-orange-400 relative overflow-hidden p-6">
      {/* Floating Balloons Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-20"
            initial={{ y: "100vh", x: `${Math.random() * 100}vw` }}
            animate={{ y: "-200px" }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear",
            }}
          >
            {i % 3 === 0
              ? "Red Balloon"
              : i % 2 === 0
              ? "Yellow Balloon"
              : "Blue Balloon"}
          </motion.div>
        ))}
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 120 }}
        className="relative z-10 bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 max-w-lg w-full border border-white/30 text-center"
      >
        {/* User Greeting */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mb-8"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-white/50 shadow-xl"
            />
          ) : (
            <div className="w-28 h-28 rounded-full mx-auto mb-4 bg-linear-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl">
              {user?.displayName?.[0] || user?.email?.[0] || "P"}
            </div>
          )}

          <h2 className="text-4xl font-bold text-white drop-shadow-lg">
            Hi,{" "}
            {user?.displayName?.split(" ")[0] ||
              user?.email?.split("@")[0] ||
              "Player"}
            !
          </h2>
          <p className="text-white/80 mt-2 text-lg">
            Ready to pop some balloons?
          </p>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-5xl font-black bg-linear-to-r from-yellow-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl"
        >
          Balloon Pop Game
        </motion.h1>

        {/* Action Buttons */}
        <div className="flex flex-col gap-5 mt-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/levels")}
            className="py-5 px-10 cursor-pointer bg-linear-to-r from-green-500 to-emerald-600 text-white text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-green-500/50 transition-all"
          >
            Select Level
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="py-4 px-8 bg-white/20 cursor-pointer border-2 border-white/50 text-white font-semibold rounded-2xl backdrop-blur-md hover:bg-white/30 transition-all"
          >
            Logout
          </motion.button>
        </div>

        {/* Fun Stats / Motivational Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-white/90 font-medium"
        >
          Pop fast • Score high • Unlock all levels!
        </motion.p>
      </motion.div>
    </div>
  );
}
