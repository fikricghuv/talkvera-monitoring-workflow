// hooks/useDebounce.ts

import { useState, useEffect } from "react";

/**
 * Custom hook untuk debounce value
 * @param value - Value yang akan di-debounce
 * @param delay - Delay dalam milliseconds
 * @param minLength - Minimum length sebelum apply debounce (default: 0)
 * @returns Debounced value
 */
export const useDebounce = (value: string, delay: number, minLength: number = 0): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update if value meets minimum length or is empty
      if (value.length >= minLength || value.length === 0) {
        setDebouncedValue(value);
      }
    }, delay);

    // Cleanup timer on value change
    return () => clearTimeout(timer);
  }, [value, delay, minLength]);

  return debouncedValue;
};