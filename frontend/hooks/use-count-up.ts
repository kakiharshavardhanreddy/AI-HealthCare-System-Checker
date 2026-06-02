"use client";

import { useEffect, useState } from "react";

export function useCountUp(value: number, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame = 0;
    const frames = Math.max(Math.round(duration / 16), 1);
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      frame += 1;
      setCount(value * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1 && frame <= frames + 8) requestAnimationFrame(tick);
    };
    tick();
  }, [value, duration]);

  return count;
}
