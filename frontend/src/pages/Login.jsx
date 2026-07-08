import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axiosClient.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      navigate("/add-product");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-mint-400">PricePulse</h1>
          <p className="text-gray-400 text-sm mt-1">Track prices. Save smarter.</p>
        </div>

        <div className="bg-navy-900 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Welcome back</h2>

          {error && (
            <p className="bg-red-500/10 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-navy-800 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-mint-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-navy-800 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-mint-400"
              required
            />
            <button
              type="submit"
              className="w-full bg-mint-400 hover:bg-mint-500 text-navy-950 font-semibold py-3 rounded-lg transition"
            >
              Log In
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-navy-800 flex-1" />
            <span className="text-gray-500 text-xs">OR</span>
            <div className="h-px bg-navy-800 flex-1" />
          </div>

          <button
            type="button"
            onClick={() => alert("Google Sign-In needs a Google Cloud OAuth Client ID — set up separately.")}
            className="w-full flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-800/70 text-white py-3 rounded-lg transition"
          >
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.85.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.96 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"/></svg>
            Continue with Google
          </button>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-mint-400 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}