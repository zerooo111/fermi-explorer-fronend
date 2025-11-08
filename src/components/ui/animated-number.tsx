import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedNumberProps {
  value: number;
  format?: Intl.NumberFormatOptions;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  trend?: number; // -1 (down), 0 (neutral), 1 (up)
  respectMotionPreference?: boolean;
  showFractions?: boolean; // If false, hides decimals during animation
}

/**
 * AnimatedNumber - A custom animated number component with smooth transitions
 * 
 * Features:
 * - Smooth number transitions with CSS transforms
 * - Trend indicators (subtle color shifts)
 * - Respects prefers-reduced-motion
 * - Performant with minimal re-renders
 * - Supports custom formatting via Intl.NumberFormat
 */
export function AnimatedNumber({
  value,
  format,
  prefix = "",
  suffix = "",
  className,
  duration = 600,
  trend = 0,
  respectMotionPreference = true,
  showFractions = true,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"up" | "down" | "neutral">("neutral");
  const previousValueRef = useRef(value);
  const animationFrameRef = useRef<number | null>(null);
  const prefersReducedMotionRef = useRef<boolean>(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined" || !respectMotionPreference) {
      prefersReducedMotionRef.current = false;
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [respectMotionPreference]);

  useEffect(() => {
    // Cleanup any ongoing animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (value === previousValueRef.current) return;

    const oldValue = previousValueRef.current;
    const newValue = value;
    
    // Determine direction
    if (newValue > oldValue) {
      setDirection("up");
    } else if (newValue < oldValue) {
      setDirection("down");
    } else {
      setDirection("neutral");
    }

    // Skip animation if reduced motion is preferred
    if (prefersReducedMotionRef.current) {
      setDisplayValue(newValue);
      previousValueRef.current = newValue;
      setIsAnimating(false);
      return;
    }

    // Determine if we should round to integers during animation
    const maxFractionDigits = format?.maximumFractionDigits ?? 2;
    const shouldRoundToInteger = maxFractionDigits === 0 && 
                                 Number.isInteger(oldValue) && 
                                 Number.isInteger(newValue);

    // Animate the transition
    setIsAnimating(true);
    
    // Use requestAnimationFrame for smooth animation
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      let currentValue = oldValue + (newValue - oldValue) * eased;
      
      // Round to integer if showFractions is false or if format doesn't allow decimals
      if (!showFractions) {
        currentValue = Math.round(currentValue);
      } else if (shouldRoundToInteger) {
        currentValue = Math.round(currentValue);
      } else if (maxFractionDigits === 0) {
        // If maxFractionDigits is 0, always round to integer
        currentValue = Math.round(currentValue);
      } else {
        // Round to the specified number of decimal places
        const decimals = maxFractionDigits;
        currentValue = Math.round(currentValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
      }
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(newValue);
        setIsAnimating(false);
        previousValueRef.current = newValue;
        animationFrameRef.current = null;
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [value, duration, format]);

  // Format the number
  // If showFractions is false and we're animating, hide decimals during animation
  const formatOptions: Intl.NumberFormatOptions = isAnimating && !showFractions
    ? {
        ...format,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    : {
        ...format,
        minimumFractionDigits: format?.minimumFractionDigits ?? 0,
        maximumFractionDigits: format?.maximumFractionDigits ?? 2,
      };

  const formattedNumber = displayValue.toLocaleString("en-US", formatOptions);

  // Determine trend-based styling
  const trendClass = 
    trend > 0 ? "text-status-green" :
    trend < 0 ? "text-status-red" :
    "";

  const shouldAnimate = !prefersReducedMotionRef.current && isAnimating;

  return (
    <span
      className={cn(
        "inline-block tabular-nums transition-colors duration-200",
        shouldAnimate && "animate-number-change",
        direction === "up" && shouldAnimate && "animate-slide-up",
        direction === "down" && shouldAnimate && "animate-slide-down",
        trendClass,
        className
      )}
      style={{
        // Use CSS custom properties for animation control
        ["--animation-duration" as string]: `${duration}ms`,
      }}
    >
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
}

