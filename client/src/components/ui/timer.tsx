import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function TimerText() {
    const [currentTime, setCurrentTime] = useState<string>("");

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(format(new Date(), "hh:mm:ss a"));
      }, 1000);
    
      return () => clearInterval(timer);
    }, []);

    return (
        <div
          className="text-5xl font-light tracking-[0.04em] text-gold mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {currentTime}
        </div>
    )
}