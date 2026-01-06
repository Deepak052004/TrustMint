const quotes = [
  "Because trust deserves proof.",
  "Verify once. Remember forever.",
  "Turning credibility into evidence.",
  "Truth, with accountability."
];

const Quotes = () => {
  return (
    <section className="py-16 md:py-20 bg-background border-t border-border">
      <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
        {quotes.map((quote, index) => (
          <p 
            key={index} 
            className="quote-text"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            "{quote}"
          </p>
        ))}
      </div>
    </section>
  );
};

export default Quotes;
