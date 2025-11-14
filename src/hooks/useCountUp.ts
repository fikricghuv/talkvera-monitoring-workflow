import { useState, useEffect, useRef } from "react";

export const useCountUp = (
  end: number,
  duration: number = 2000,
  decimals: number = 0,
  prefix: string = '',
  suffix: string = '',
  useLocaleString: boolean = false
): string => {
  const [count, setCount] = useState(0);
  const [displayValue, setDisplayValue] = useState('0');
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const endValue = parseFloat(String(end)) || 0;
    startTimeRef.current = null;
    countRef.current = 0;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      const currentCount = endValue * easeOut;
      countRef.current = currentCount;
      setCount(currentCount);

      if (useLocaleString) {
        setDisplayValue(Math.round(currentCount).toLocaleString());
      } else if (decimals > 0) {
        setDisplayValue(currentCount.toFixed(decimals));
      } else {
        setDisplayValue(Math.round(currentCount).toString());
      }

      if (percentage < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
        if (useLocaleString) {
          setDisplayValue(Math.round(endValue).toLocaleString());
        } else if (decimals > 0) {
          setDisplayValue(endValue.toFixed(decimals));
        } else {
          setDisplayValue(Math.round(endValue).toString());
        }
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, duration, decimals, useLocaleString]);

  return `${prefix}${displayValue}${suffix}`;
};