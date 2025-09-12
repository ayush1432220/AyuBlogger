import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Star, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [field, setField] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post("/user/login", field, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Login successful! Redirecting...", {
          position: "top-right",
          theme: "colored",
        });
        setTimeout(() => navigate("/"), 1500);
      } else {
        toast.error(data.message || "Login failed", {
          position: "top-right",
          theme: "colored",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(
        err.response?.data?.message || "Login failed. Please try again.",
        {
          position: "top-right",
          theme: "colored",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 overflow-hidden font-inter relative">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-indigo-600/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-400/30 to-purple-400/30 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/30 to-blue-400/30 rounded-full blur-3xl animate-float-slower"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-float-reverse"></div>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <Star className="w-2 h-2 text-white/40 fill-white/40" />
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-400 to-purple-600 rounded-2xl shadow-2xl mb-4 animate-glow">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-violet-200/80 text-sm">
            Sign in to continue your journey
          </p>
        </div>

        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Email */}
            <div className="relative mb-6 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Mail className="h-5 w-5 text-violet-300 group-focus-within:text-violet-400 transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                value={field.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-violet-300/60 focus:border-violet-400/50 focus:bg-white/10 focus:ring-2 focus:ring-violet-400/20 outline-none transition-all duration-300 hover:bg-white/[0.07]"
              />
            </div>

            {/* Password */}
            <div className="relative mb-6 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Lock className="h-5 w-5 text-violet-300 group-focus-within:text-violet-400 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={field.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-violet-300/60 focus:border-violet-400/50 focus:bg-white/10 focus:ring-2 focus:ring-violet-400/20 outline-none transition-all duration-300 hover:bg-white/[0.07]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-violet-300 hover:text-violet-200 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-white text-lg
                        bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500
                        hover:from-violet-400 hover:via-purple-400 hover:to-indigo-400
                        disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group`}
            >
              {loading ? (
                <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
              ) : null}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <span className="px-4 text-violet-200/60 text-sm">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>

            {/* Google login */}
            <button
              type="button"
              onClick={async() =>{
                
                const { data } = await API.get("/user/auth/google"); 
                console.log(data)
      if (data?.url) {
        window.location.href = data.url;
              }
              }
                // (window.location.href =
                //   "http://localhost:3000/user/auth/google")

                
              }
              className="w-full py-4 px-6 rounded-2xl font-semibold text-white text-lg
                       bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30
                       flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285f4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34a853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#fbbc05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#ea4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Sign up link */}
            <div className="text-center mt-6">
              <p className="text-violet-200/80">
                Don't have an account?{" "}
                <Link to="/user/signup">
                  <button className="text-violet-300 hover:text-violet-200 font-semibold transition-colors hover:underline">
                    Sign up
                  </button>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
        .font-inter {
          font-family: "Inter", sans-serif;
        }
      `}</style>
    </div>
  );
}
