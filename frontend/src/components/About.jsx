import { useEffect, useRef, useState } from "react";

const About = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getAnimationStyle = (index) => ({
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
    transitionDelay: `${index * 150}ms`,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
  });

  return (
    <section id="about" className="py-16 md:py-24 bg-background border-t border-border">
      <div 
        ref={sectionRef}
        className="max-w-4xl mx-auto px-6 md:px-12"
      >
        <h2 
          className="section-title mb-12"
          style={getAnimationStyle(0)}
        >
          About TrustMint
        </h2>
        
        <div className="space-y-8 text-foreground/90 leading-relaxed text-lg">
          <p 
            className="font-medium text-xl"
            style={getAnimationStyle(1)}
          >
            Truth doesn't fail — trust does.
          </p>
          
          <p style={getAnimationStyle(2)}>
            TrustMint exists to bring accountability back to information in an age where headlines travel faster than facts. We combine machine intelligence with tamper-proof records to evaluate the credibility of news content and preserve its verification permanently.
          </p>
          
          <p style={getAnimationStyle(3)}>
            Unlike traditional fact-checks that disappear in timelines, TrustMint creates a verifiable proof of analysis — ensuring that what was checked, when it was checked, and what the result was can never be altered or erased.
          </p>
          
          <p style={getAnimationStyle(4)}>Our mission is simple :</p>
          
          <p 
            className="text-2xl md:text-3xl font-serif font-semibold text-center py-6 text-foreground"
            style={getAnimationStyle(5)}
          >
            Make truth verifiable, transparent, and resilient to manipulation.
          </p>
          
          <p style={getAnimationStyle(6)}>
            TrustMint is not here to decide what people should believe. It exists to give people context, confidence, and clarity — before misinformation does the damage.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
