"use client";

import { Check, X } from "lucide-react";
import { PasswordStrength, getStrengthColor } from "@/lib/passwordStrength";

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  showFeedback?: boolean;
}

export default function PasswordStrengthIndicator({
  strength,
  showFeedback = true,
}: PasswordStrengthIndicatorProps) {
  const levels = ['weak', 'fair', 'good', 'strong'];
  const colors = {
    weak: 'bg-red-500',
    fair: 'bg-amber-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500',
  };

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1.5 h-1.5">
        {levels.map((level, idx) => (
          <div
            key={level}
            className={`flex-1 rounded-full transition-all duration-300 ${
              idx <= strength.score ? colors[strength.level] : 'bg-gray-700'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Strength label and feedback */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase text-gray-400">
          Strength: <span className={`ml-1 ${getStrengthColor(strength.level)}`}>
            {strength.level}
          </span>
        </span>
      </div>

      {/* Feedback */}
      {showFeedback && strength.feedback.length > 0 && (
        <div className="space-y-1 mt-3 pt-3 border-t border-white/5">
          {strength.feedback.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-gray-400">
              <X className="h-3 w-3 mt-0.5 flex-shrink-0 text-red-400" aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* Requirements met */}
      {strength.isValid && (
        <div className="flex items-center gap-2 text-xs text-green-400 pt-2">
          <Check className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <span>Password meets requirements</span>
        </div>
      )}
    </div>
  );
}
