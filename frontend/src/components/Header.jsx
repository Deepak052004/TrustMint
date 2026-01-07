import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, target) => {
    e.preventDefault();
    
    if (target === "home") {
      if (location.pathname !== "/") {
        navigate("/");
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(target);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        const element = document.getElementById(target);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <header className="bg-header text-header-foreground py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="text-2xl font-bold font-serif tracking-tight cursor-pointer"
          onClick={() => navigate("/")}
        >
          TrustMint
        </div>
        <nav className="flex items-center gap-8">
          <a href="#home" onClick={(e) => handleNavClick(e, "home")} className="nav-link">Home</a>
          <a href="#about" onClick={(e) => handleNavClick(e, "about")} className="nav-link">About</a>
          <a href="#contact" onClick={(e) => handleNavClick(e, "contact")} className="nav-link">Contact</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
