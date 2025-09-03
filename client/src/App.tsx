import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import Home from "@/pages/home";
import Chapters from "@/pages/chapters";
import ChapterReader from "@/pages/chapter-reader";
import Characters from "@/pages/characters";
import CharacterProfile from "@/pages/character-profile";
import World from "@/pages/world";
import Codex from "@/pages/codex";
import Blog from "@/pages/blog";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function ScrollIndicator() {
  useEffect(() => {
    const updateScrollIndicator = () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      const indicator = document.querySelector('.scroll-indicator') as HTMLElement;
      if (indicator) {
        indicator.style.transform = `scaleX(${scrolled / 100})`;
      }
    };

    window.addEventListener('scroll', updateScrollIndicator);
    return () => window.removeEventListener('scroll', updateScrollIndicator);
  }, []);

  return <div className="scroll-indicator" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/chapters" component={Chapters} />
      <Route path="/chapters/:slug" component={ChapterReader} />
      <Route path="/characters" component={Characters} />
  <Route path="/characters/:id" component={CharacterProfile} />
      <Route path="/world" component={World} />
      <Route path="/codex" component={Codex} />
      <Route path="/blog" component={Blog} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <ScrollIndicator />
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
