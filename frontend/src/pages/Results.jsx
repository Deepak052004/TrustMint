import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { X, Info } from "lucide-react";
import newspaperBg from "@/assets/newspaper-hero.jpg";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

const Results = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  /* ---------------- SAFETY ---------------- */
  if (!state) {
    navigate("/verify");
    return null;
  }

  /* ---------------- BACKEND DATA ---------------- */
  const trustScore = Math.round((state.trustScore ?? 0) * 100);
  const credibility = state.credibility ?? "UNCERTAIN";
  const eligibleForNFT = state.eligibleForNFT === true;
  const lifecycle = state.lifecycle;

  /* ---------------- UI STATE ---------------- */
  const [animatedScore, setAnimatedScore] = useState(0);
  const [visibleElements, setVisibleElements] = useState(0);

  const [showNFTPopup, setShowNFTPopup] = useState(false);
  const [showConfidencePopup, setShowConfidencePopup] = useState(false);

  const [mintedNFT, setMintedNFT] = useState(null);
  const [minting, setMinting] = useState(false);

  /* ---------------- ANIMATION STATE (ADDED) ---------------- */
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isNFTHovering, setIsNFTHovering] = useState(false);
  const [isConfidenceHovering, setIsConfidenceHovering] = useState(false);

  const nftCardRef = useRef(null);
  const confidenceCardRef = useRef(null);

  /* ---------------- ENTRY ANIMATION ---------------- */
  useEffect(() => {
    const timers = [];
    for (let i = 1; i <= 5; i++) {
      timers.push(setTimeout(() => setVisibleElements(i), i * 200));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  /* ---------------- SCORE ANIMATION ---------------- */
  useEffect(() => {
    if (visibleElements < 2) return;

    const start = Date.now();
    const duration = 1200;

    const animate = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      setAnimatedScore(progress * trustScore);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [trustScore, visibleElements]);

  /* ---------------- GLOBAL MOUSE TRACKING (ADDED) ---------------- */
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const shouldTrack =
      (showNFTPopup && !isNFTHovering) ||
      (showConfidencePopup && !isConfidenceHovering);

    if (shouldTrack) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [showNFTPopup, showConfidencePopup, isNFTHovering, isConfidenceHovering]);

  /* ---------------- 3D CARD TRANSFORM (ADDED) ---------------- */
  const getCardTransform = (active, hovering, ref) => {
    if (!active || hovering || !ref.current) {
      return { transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)" };
    }

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (mousePos.x - centerX) / 20;
    const deltaY = (mousePos.y - centerY) / 20;

    const rotateY = Math.max(-15, Math.min(15, deltaX));
    const rotateX = Math.max(-15, Math.min(15, -deltaY));

    return {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    };
  };

  /* ---------------- HELPERS ---------------- */
  const elementClass = (i) =>
    `transition-all duration-500 ${
      visibleElements >= i
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-8"
    }`;

  const progressColor =
    trustScore >= 65
      ? "bg-emerald-500"
      : trustScore < 40
      ? "bg-red-500"
      : "bg-gray-500";

  const badgeColor =
    credibility === "HIGH_CREDIBILITY"
      ? "bg-emerald-500"
      : credibility === "LOW_CREDIBILITY"
      ? "bg-red-500"
      : "bg-gray-500";

  /* ---------------- NFT MINT (SIMULATED — UNCHANGED) ---------------- */
  const handleMintNFT = async () => {
    if (!eligibleForNFT) return;

    setMinting(true);

    setTimeout(() => {
      const simulatedNFT = {
        ipfsCid: `QmSIM_${Math.random().toString(36).substring(2, 10)}`,
        tokenId: Math.floor(100000 + Math.random() * 900000),
        transactionHash: `0xSIM_${Math.random().toString(36).substring(2, 18)}`,
        chain: "Polygon (Simulated)",
        mintedAt: new Date().toISOString(),
      };

      setMintedNFT(simulatedNFT);
      setShowNFTPopup(true);
      setMinting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main
        className="relative min-h-[calc(100vh-64px)] py-12 px-6"
        style={{
          backgroundImage: `url(${newspaperBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-hero-overlay/80" />

        <div className="relative z-10 max-w-3xl mx-auto text-white">
          <h1 className={`text-4xl font-serif text-center mb-10 ${elementClass(1)}`}>
            Verification Results
          </h1>

          {/* PROGRESS BAR */}
          <div className={`mb-6 ${elementClass(2)}`}>
            <div className="w-full h-8 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full ${progressColor}`}
                style={{ width: `${animatedScore}%` }}
              />
            </div>
          </div>

          {/* CREDIBILITY BADGE */}
          <div className={`flex justify-center mb-8 ${elementClass(3)}`}>
            <div className={`px-8 py-3 rounded-xl font-semibold shadow-lg ${badgeColor}`}>
              {credibility.replace("_", " ")}
            </div>
          </div>

          {/* TRUST SCORE */}
          <div className={`bg-white/95 text-black rounded-2xl p-6 mb-6 ${elementClass(4)}`}>
            <h2 className="text-xl font-semibold mb-2">Trust Score</h2>
            <p className="text-3xl font-bold">{trustScore}%</p>
          </div>

          {/* ACTION BUTTONS */}
          <div className={`grid grid-cols-2 gap-4 ${elementClass(5)}`}>
            <button
              onClick={() => setShowConfidencePopup(true)}
              className="py-4 bg-white text-black rounded-xl font-medium hover:scale-[1.02]"
            >
              View Confidence Analysis
            </button>

            <button
              onClick={handleMintNFT}
              disabled={!eligibleForNFT || minting}
              className={`py-4 rounded-xl font-medium transition-all ${
                eligibleForNFT
                  ? "bg-black text-white hover:scale-[1.02]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {minting ? "Minting..." : "Mint Trust NFT"}
            </button>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate("/verify")}
              className="px-6 py-3 bg-white text-black rounded-xl"
            >
              Verify Another News
            </button>
          </div>
        </div>
      </main>

      {/* ---------------- CONFIDENCE POPUP (ANIMATED) ---------------- */}
      {showConfidencePopup && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <Card
            ref={confidenceCardRef}
            onMouseEnter={() => setIsConfidenceHovering(true)}
            onMouseLeave={() => setIsConfidenceHovering(false)}
            style={{
              ...getCardTransform(
                showConfidencePopup,
                isConfidenceHovering,
                confidenceCardRef
              ),
              transition: isConfidenceHovering
                ? "transform 0.3s ease-out"
                : "transform 0.1s ease-out",
            }}
            className="w-full max-w-lg relative"
          >
            <button
              onClick={() => setShowConfidencePopup(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>

            <CardHeader>
              <CardTitle>Confidence Analysis</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              {[
                {
                  label: "ML Probability",
                  hint: "Neural network confidence score",
                  value: state.confidenceBreakdown?.mlProbability ?? trustScore * 0.35,
                },
                {
                  label: "Source Credibility",
                  hint: "Historical reliability of the source",
                  value: state.confidenceBreakdown?.sourceCredibility ?? trustScore * 0.2,
                },
                {
                  label: "Context Length",
                  hint: "Amount of textual evidence",
                  value: state.confidenceBreakdown?.contextLength ?? trustScore * 0.15,
                },
                {
                  label: "Linguistic Certainty",
                  hint: "Overconfidence & assertive language detection",
                  value: state.confidenceBreakdown?.linguisticCertainty ?? trustScore * 0.15,
                },
                {
                  label: "Emotional Manipulation",
                  hint: "Clickbait & emotional trigger detection",
                  value: state.confidenceBreakdown?.emotionalManipulation ?? trustScore * 0.15,
                },
              ].map(({ label, hint, value }) => {
                const percent = Math.min(100, Math.round(value));

                return (
                  <div key={label} className="space-y-1">
                    <HoverCard>
                      <HoverCardTrigger className="flex justify-between items-center cursor-help">
                        <span className="font-medium">{label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{percent}%</span>
                          <Info size={14} />
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent>{hint}</HoverCardContent>
                    </HoverCard>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          percent >= 65
                            ? "bg-emerald-500"
                            : percent < 40
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---------------- NFT POPUP (ANIMATED) ---------------- */}
      {showNFTPopup && mintedNFT && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <Card
            ref={nftCardRef}
            onMouseEnter={() => setIsNFTHovering(true)}
            onMouseLeave={() => setIsNFTHovering(false)}
            style={{
              ...getCardTransform(showNFTPopup, isNFTHovering, nftCardRef),
              transition: isNFTHovering
                ? "transform 0.3s ease-out"
                : "transform 0.1s ease-out",
            }}
            className="w-full max-w-md relative"
          >
            <button
              onClick={() => setShowNFTPopup(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>

            <CardHeader>
              <CardTitle>Trusted Content NFT</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              <p><b>Trust Score:</b> {trustScore}%</p>
              <p><b>Article Hash:</b> {state.articleHash}</p>
              <p><b>First Verified:</b> {lifecycle.firstVerifiedAt}</p>
              <p><b>Last Verified:</b> {lifecycle.lastVerifiedAt}</p>
              <p><b>Verifications:</b> {lifecycle.verificationCount}</p>

              <hr />

              <p><b>IPFS CID:</b> {mintedNFT.ipfsCid}</p>
              <p><b>Token ID:</b> {mintedNFT.tokenId}</p>
              <p><b>Transaction Hash:</b> {mintedNFT.transactionHash}</p>
              <p><b>Chain:</b> {mintedNFT.chain}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Results;
