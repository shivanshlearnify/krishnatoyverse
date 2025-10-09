"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function AnnouncementBar() {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [textCopies, setTextCopies] = useState(1);

  const text = "New Arrivals Every Week! 🧸   ";

  useEffect(() => {
    const updateCopies = () => {
      if (!containerRef.current || !textRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.offsetWidth;
      const copies = Math.ceil(containerWidth / textWidth) + 1;
      setTextCopies(copies);
    };

    updateCopies();
    window.addEventListener("resize", updateCopies);
    return () => window.removeEventListener("resize", updateCopies);
  }, []);

  return (
    <div ref={containerRef} className="w-full overflow-hidden bg-[#691080] py-2">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["-50%", "0%"] }} // left-to-right
        transition={{
          x: { repeat: Infinity, repeatType: "loop", duration: 20, ease: "linear" },
        }}
      >
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex">
            {Array(textCopies)
              .fill(text)
              .map((t, idx) => (
                <span
                  key={idx}
                  ref={i === 0 && idx === 0 ? textRef : null}
                  className="text-white text-lg mr-8" // add gap between text
                >
                  {t}
                </span>
              ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
