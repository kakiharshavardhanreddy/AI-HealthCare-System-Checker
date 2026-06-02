"use client";

import { useEffect } from "react";

export function ScrollProgress() {
  useEffect(() => {
    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const width = height <= 0 ? 0 : (window.scrollY / height) * 100;
      document.documentElement.style.setProperty("--scroll-width", `${width}%`);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <div className="scroll-progress" />;
}
