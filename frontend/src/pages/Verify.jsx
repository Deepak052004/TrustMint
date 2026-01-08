import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import newspaperBg from "@/assets/newspaper-hero.jpg";
import { Search } from "lucide-react";

const Verify = () => {
  const [newsUrl, setNewsUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleAnalyze = async () => {
    const text = content.trim() || headline.trim();

    if (!text) {
      alert("Please enter a headline or article text");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://trustmint-vqux.onrender.com/api/verify-news",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: text,
            sourceUrl: newsUrl.trim(),
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Backend error");
      }

      const data = await res.json();

      // Navigate to results with backend response
      navigate("/results", { state: data });
    } catch (err) {
      console.error(err);
      alert("Verification failed. Please ensure backend services are running.");
    } finally {
      setLoading(false);
    }
  };

  const handleTryExample = () => {
    setNewsUrl(
      "https://www.reuters.com/world/scientists-renewable-energy-breakthrough"
    );
    setHeadline("Scientists discover breakthrough in renewable energy");
    setContent(
      "Scientists have announced a major breakthrough in renewable energy technology. " +
        "The discovery could significantly reduce production costs while increasing energy efficiency, " +
        "according to researchers involved in the study."
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main
        className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-12"
        style={{
          backgroundImage: `url(${newspaperBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-hero-overlay/80 pointer-events-none" />

        {/* CONTENT */}
        <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white text-center mb-10">
            News Trust Analysis
          </h1>

          <div className="space-y-4">
            <input
              type="url"
              value={newsUrl}
              onChange={(e) => setNewsUrl(e.target.value)}
              placeholder="News URL (optional)"
              className="w-full px-5 py-4 bg-white/95 text-foreground placeholder:text-muted-foreground rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-accent text-base"
            />

            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Headline or full article text"
              className="w-full px-5 py-4 bg-white/95 text-foreground placeholder:text-muted-foreground rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-accent text-base"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
              rows={4}
              className="w-full px-5 py-4 bg-white/95 text-foreground placeholder:text-muted-foreground rounded-3xl border-0 focus:outline-none focus:ring-2 focus:ring-accent text-base resize-none"
            />

            <div className="space-y-2 py-2">
              <div className="flex items-center gap-3 text-white">
                <span className="w-3 h-3 bg-blue-500 rounded-sm shadow-[0_0_10px_3px_rgba(59,130,246,0.6)]" />
                <p className="text-sm md:text-base">
                  <span className="font-semibold">Headlines</span> receive a
                  preliminary credibility signal.
                </p>
              </div>
              <div className="flex items-center gap-3 text-white">
                <span className="w-3 h-3 bg-emerald-500 rounded-sm shadow-[0_0_10px_3px_rgba(16,185,129,0.6)]" />
                <p className="text-sm md:text-base">
                  <span className="font-semibold">Full articles</span> enable
                  consensus-based trust certification.
                </p>
              </div>
            </div>

            <button
              onClick={handleTryExample}
              className="w-full py-4 bg-white text-foreground font-medium rounded-xl hover:bg-white/90 hover:scale-[1.02] transition-all duration-200"
            >
              Try Certified Article Example
            </button>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Search size={20} />
              {loading ? "Analyzing..." : "Analyze Trust"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Verify;
