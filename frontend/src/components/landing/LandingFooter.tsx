import { FileText, Github, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const LandingFooter = () => {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="gradient-bg rounded-lg p-1.5">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            ResumeForge
          </Link>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground">
            <Github className="h-5 w-5 hover:text-foreground transition-colors cursor-pointer" />
            <Twitter className="h-5 w-5 hover:text-foreground transition-colors cursor-pointer" />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          © 2026 ResumeForge. Built with ❤️
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
