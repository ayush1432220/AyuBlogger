import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import API from "../api";

export default function SignUpPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const sendOtpHandler = async () => {
    setLoading(true);
    try {
      const { data } = await API.post("/user/signup", form, { withCredentials: true });
      toast.success(data.message || "OTP sent successfully!");
      setStage("verify");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpHandler = async () => {
    setLoading(true);
    try {
      const { data } = await API.post("/user/verify", { email: form.email, otp }, { withCredentials: true });
      toast.success(data.message || "Account verified successfully!");
      if (data.success) setTimeout(() => navigate("/user/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 overflow-hidden font-inter relative">

      {/* Animated background elements */}
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
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <Star className="w-2 h-2 text-white/40 fill-white/40" />
          </div>
        ))}
      </div>

      {/* Main form container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Decorative header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-400 to-purple-600 rounded-2xl shadow-2xl mb-4 animate-glow">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent mb-2">
            {stage === "signup" ? "Create Account" : "Verify OTP"}
          </h1>
          <p className="text-violet-200/80 text-sm">
            {stage === "signup" ? "Sign up to start your journey" : "Enter the OTP sent to your email"}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

            {stage === "signup" && (
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); sendOtpHandler(); }}>
                {/* Name */}
                <div className="relative mb-6 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <User className="h-5 w-5 text-violet-300 group-focus-within:text-violet-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl 
                      text-white placeholder-violet-300/60 
                      focus:border-violet-400/50 focus:bg-white/10 focus:ring-2 focus:ring-violet-400/20 
                      outline-none transition-all duration-300 hover:bg-white/[0.07] peer"
                  />
                </div>

                {/* Email */}
                <div className="relative mb-6 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Mail className="h-5 w-5 text-violet-300 group-focus-within:text-violet-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl 
                      text-white placeholder-violet-300/60 
                      focus:border-violet-400/50 focus:bg-white/10 focus:ring-2 focus:ring-violet-400/20 
                      outline-none transition-all duration-300 hover:bg-white/[0.07] peer"
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
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl 
                      text-white placeholder-violet-300/60 
                      focus:border-violet-400/50 focus:bg-white/10 focus:ring-2 focus:ring-violet-400/20 
                      outline-none transition-all duration-300 hover:bg-white/[0.07] peer"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-violet-300 hover:text-violet-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold text-white text-lg
                    bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500
                    hover:from-violet-400 hover:via-purple-400 hover:to-indigo-400
                    transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                    hover:shadow-violet-500/25 active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    relative overflow-hidden group`}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            )}

            {stage === "verify" && (
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); verifyOtpHandler(); }}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-5 py-3 text-center tracking-[0.5em] rounded-lg bg-white/20 text-white placeholder-white/70
                    focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white/30
                    transition-all duration-300"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-white text-lg
                    bg-gradient-to-r from-teal-400 to-blue-500
                    hover:from-teal-500 hover:to-blue-600
                    transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                    active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }

        @keyframes float-slow { 0%,100%{transform:translate(0,0)}25%{transform:translate(10px,-10px) rotate(1deg)}50%{transform:translate(-5px,-20px) rotate(-1deg)}75%{transform:translate(-10px,5px) rotate(0.5deg)} }
        @keyframes float-slower { 0%,100%{transform:translate(0,0)}33%{transform:translate(-15px,10px) rotate(-1deg)}66%{transform:translate(10px,-15px) rotate(1deg)} }
        @keyframes float-reverse { 0%,100%{transform:translate(0,0)}50%{transform:translate(20px,20px) rotate(2deg)} }
        @keyframes twinkle {0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes fade-in-down {0%{opacity:0;transform:translateY(-20px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes fade-in-up {0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes glow {0%,100%{box-shadow:0 0 20px rgba(139,92,246,0.3)}50%{box-shadow:0 0 30px rgba(139,92,246,0.5),0 0 40px rgba(139,92,246,0.3)}}

        .animate-float-slow {animation:float-slow 8s ease-in-out infinite;}
        .animate-float-slower {animation:float-slower 12s ease-in-out infinite;}
        .animate-float-reverse {animation:float-reverse 10s ease-in-out infinite reverse;}
        .animate-twinkle {animation:twinkle ease-in-out infinite;}
        .animate-fade-in-down {animation:fade-in-down 0.8s ease-out;}
        .animate-fade-in-up {animation:fade-in-up 0.8s ease-out 0.2s both;}
        .animate-glow {animation:glow 3s ease-in-out infinite;}
      `}</style>
    </div>
  );
}
