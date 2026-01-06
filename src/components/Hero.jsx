import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import newspaperBg from "@/assets/newspaper-hero.jpg";
import PageTransition from "@/components/PageTransition";

const Hero = () => {
  const fullText = "Verify The Truth Behind Every Headline";
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  const handleGetStarted = () => {
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    navigate("/verify");
  };

  return (
    <>
      <PageTransition isActive={showTransition} onComplete={handleTransitionComplete} />
      <section 
        id="home"
        className="relative min-h-[70vh] flex items-center justify-center"
        style={{
          backgroundImage: `url(${newspaperBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-hero-overlay/75" />
        
        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight min-h-[1.2em] md:min-h-[2.4em]">
            {displayedText}
            <span className={`inline-block w-[3px] h-[1em] bg-white ml-1 align-middle ${isTypingComplete ? 'animate-pulse' : 'animate-[blink_0.7s_infinite]'}`} />
          </h1>
          <p 
            className={`text-lg md:text-xl text-white/90 mb-10 font-light transition-opacity duration-500 ${isTypingComplete ? 'opacity-100' : 'opacity-0'}`}
          >
            Cutting through misinformation with AI-powered fact-checking
          </p>
          <button 
            onClick={handleGetStarted}
            className={`bg-primary text-primary-foreground px-10 py-4 text-lg font-medium rounded-full shadow-lg hover:scale-110 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${isTypingComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Get Started
          </button>
        </div>
      </section>
    </>
  );
};

export default Hero;
