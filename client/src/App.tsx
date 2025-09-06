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
import LocationProfile from "@/pages/location-profile";
import Codex from "@/pages/codex";
import CodexEntryProfile from "@/pages/codex-entry";
import Blog from "@/pages/blog";
import BlogPostProfile from "@/pages/blog-post";
import Admin from "@/pages/admin";
import CharacterPage from "@/pages/character";
import CodexEntryPage from "@/pages/codex-entry";
import LocationPage from "@/pages/location";
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
<<<<<<< HEAD
  <Route path="/characters/:slug" component={CharacterProfile} />
      <Route path="/world" component={World} />
      <Route path="/world/:id" component={LocationProfile} />
      <Route path="/codex" component={Codex} />
      <Route path="/codex/:id" component={CodexEntryProfile} />
=======
  <Route path="/characters/:id" component={CharacterPage} />
      <Route path="/world" component={World} />
  <Route path="/world/:id" component={LocationPage} />
      <Route path="/codex" component={Codex} />
  <Route path="/codex/:id" component={CodexEntryPage} />
>>>>>>> 62c653961657e3119ed8e2a10375ecbc1fa9a36a
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPostProfile} />
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
