import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RegionProvider } from "@/contexts/RegionContext";
import { SplashScreen } from "@/components/SplashScreen";
import { RegionSelector } from "@/components/RegionSelector";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Visit from "@/pages/Visit";
import HowItWorks from "@/pages/HowItWorks";
import Privacy from "@/pages/Privacy";
import About from "@/pages/About";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/visit" component={Visit} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("splashShown");
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem("splashShown", "true");
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RegionProvider>
          <Toaster />
          {showSplash ? (
            <SplashScreen onComplete={handleSplashComplete} />
          ) : (
            <Router />
          )}
        </RegionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
