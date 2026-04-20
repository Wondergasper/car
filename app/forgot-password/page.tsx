"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
      toast.success("Reset link sent!");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-blue/10 rounded-full blur-[120px] opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-purple/10 rounded-full blur-[120px] opacity-20" />
      </div>

      <motion.div
        className="w-full max-w-md space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue shadow-lg shadow-brand-blue/30 mx-auto">
            <ShieldAlert className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
              {submitted ? "Check your email" : "Forgot password?"}
            </h1>
            <p className="text-gray-400 text-sm max-w-[280px] mx-auto leading-relaxed">
              {submitted 
                ? `We've sent a password reset link to ${email}`
                : "No worries, we'll send you reset instructions. Enter the email associated with your account."}
            </p>
          </div>
        </div>

        {/* Content */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-600 focus:bg-white/[0.05] focus:border-brand-cyan/50 focus:ring-4 focus:ring-brand-cyan/10 transition-all outline-none shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-gradient-to-r from-brand-blue via-brand-blue to-brand-cyan text-white font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/40 active:scale-[0.98] disabled:opacity-50 transition-all duration-300 group"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <CheckCircle2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-brand-blue/5 border border-brand-blue/20 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-brand-blue/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-brand-cyan" />
              </div>
              <p className="text-sm text-gray-300">
                Didn&apos;t receive the email?{" "}
                <button 
                  onClick={handleSubmit}
                  className="text-brand-cyan hover:text-brand-blue font-bold transition-colors"
                >
                  Click to resend
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Back to login */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-all group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
