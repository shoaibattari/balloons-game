import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const msg =
        err.code === "auth/user-not-found"
          ? "No account found with this email."
          : err.code === "auth/wrong-password"
          ? "Incorrect password."
          : err.code === "auth/email-already-in-use"
          ? "This email is already registered."
          : err.code === "auth/weak-password"
          ? "Password should be at least 6 characters."
          : err.code === "auth/invalid-email"
          ? "Please enter a valid email."
          : "Something went wrong. Try again.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError("Google login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Glassmorphism Card */}
        <div className="bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/30">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              {isLogin ? "Welcome Back!" : "Join the Fun!"}
            </h1>
            <p className="text-white/80 mt-2">
              {isLogin
                ? "Log in to pop some balloons"
                : "Create account & start playing"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-5">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-5 py-4 rounded-2xl bg-white/30 placeholder-white/70 text-white border border-white/40 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
            />

            {/* Password Field with Eye Toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-5 py-4 rounded-2xl bg-white/30 placeholder-white/70 text-white border border-white/40 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 cursor-pointer top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-200 text-sm bg-red-500/20 px-4 py-3 rounded-xl border border-red-400/50 text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 cursor-pointer bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      opacity="0.3"
                    />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Please wait...
                </>
              ) : isLogin ? (
                "Login Now"
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-white/30"></div>
            <span className="px-4 text-white/70 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-white/30"></div>
          </div>

          {/* Google Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 cursor-pointer bg-white text-gray-800 font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all disabled:opacity-70"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-6 h-6"
            />
            Continue with Google
          </motion.button>

          {/* Toggle Login/Signup */}
          <p className="text-center mt-8 text-white/90">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setPassword("");
                setShowPassword(false);
              }}
              className="font-bold underline underline-offset-4 cursor-pointer hover:text-cyan-300 transition-colors"
            >
              {isLogin ? "Sign up free" : "Log in instead"}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-sm mt-8">
          Pop balloons, beat levels, have fun!
        </p>
      </motion.div>
    </div>
  );
}
