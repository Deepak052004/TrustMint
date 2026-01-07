import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const PageTransition = ({ isActive, onComplete }) => {
  const [phase, setPhase] = useState("enter"); // enter, spin, exit

  useEffect(() => {
    if (isActive) {
      setPhase("enter");
      
      // Start spinning after entering
      const spinTimer = setTimeout(() => {
        setPhase("spin");
      }, 300);

      // Start exit after spinning
      const exitTimer = setTimeout(() => {
        setPhase("exit");
      }, 1200);

      // Complete transition
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 1600);

      return () => {
        clearTimeout(spinTimer);
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-header transition-opacity duration-300 ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div 
        className={`text-white transition-all duration-300 ${
          phase === "enter" ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <Search 
          size={80} 
          className={`${phase === "spin" ? "animate-[spin-search_0.8s_ease-in-out]" : ""}`}
          strokeWidth={1.5}
        />
      </div>
      <style>{`
        @keyframes spin-search {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default PageTransition;
