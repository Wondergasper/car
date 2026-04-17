"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
import { calculatePasswordStrength } from "@/lib/passwordStrength";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    industry: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const passwordStrength = calculatePasswordStrength(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password.length > 0;
  const isFormValid =
    formData.companyName.trim() &&
    formData.email.trim() &&
    passwordStrength.isValid &&
    passwordsMatch &&
    agreedToTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setError("Please fill in all required fields correctly");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authApi.register({
        email: formData.email,
        password: formData.password,
        company_name: formData.companyName,
        industry: formData.industry || undefined,
      });

      toast.success("Account created! Please sign in to continue.");
      router.push("/login?registered=true");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center px-4 py-12">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-blue/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-cyan/20 rounded-full blur-3xl opacity-20" />
      </div>

      <motion.div
        className="w-full max-w-md space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo & Branding */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-blue shadow-lg shadow-brand-blue/30 mx-auto">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
              Get started
            </h1>
            <p className="text-gray-400 text-sm">
              Create your CAR-Bot account in minutes
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
              role="alert"
            >
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-400">Registration failed</p>
                <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Company Name */}
          <div className="space-y-2">
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-300">
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              placeholder="Your Company Ltd."
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30 focus:ring-offset-2 focus:ring-offset-[color:var(--background)]"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@company.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30 focus:ring-offset-2 focus:ring-offset-[color:var(--background)]"
            />
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <label htmlFor="industry" className="block text-sm font-medium text-gray-300">
              Industry (Optional)
            </label>
            <select
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30 focus:ring-offset-2 focus:ring-offset-[color:var(--background)]"
            >
              <option value="">Select an industry...</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="technology">Technology</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30 focus:ring-offset-2 focus:ring-offset-[color:var(--background)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-brand-cyan rounded"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {/* Password strength indicator */}
            {formData.password && (
              <PasswordStrengthIndicator strength={passwordStrength} showFeedback={true} />
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border transition-all duration-200 text-white placeholder:text-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--background)] ${
                  formData.confirmPassword
                    ? passwordsMatch
                      ? "border-green-500/30 focus:border-green-500"
                      : "border-red-500/30 focus:border-red-500"
                    : "border-white/10 focus:border-brand-cyan focus:ring-brand-cyan/30"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-brand-cyan rounded"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {formData.confirmPassword && (
              <div
                className={`flex items-center gap-2 text-xs ${
                  passwordsMatch ? "text-green-400" : "text-red-400"
                }`}
              >
                {passwordsMatch ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
              </div>
            )}
          </div>

          {/* Terms agreement */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
              className="h-4 w-4 mt-0.5 rounded border border-white/20 bg-white/5 text-brand-cyan focus:ring-2 focus:ring-brand-cyan/30 transition-all cursor-pointer flex-shrink-0"
            />
            <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
              I agree to the{" "}
              <Link href="/legal/terms" className="text-brand-cyan hover:text-brand-blue underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="text-brand-cyan hover:text-brand-blue underline">
                Privacy Policy
              </Link>
            </span>
          </label>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-brand-cyan"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create account
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[color:var(--background)] text-gray-500">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            <Link
              href="/login"
              className="font-semibold text-brand-cyan hover:text-brand-blue transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-brand-cyan rounded px-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
